define([
    'firebase',
    'jquery',
    'lodash',
    'phaser',
    'promise',
    'core/Utilities',
    'core/Engine',
    'core/Player',
    'core/PointsManager',
    'core/helpers/AssetsLoader',
    'core/helpers/Scheduler',
    'core/helpers/Storage'
], function (Firebase, $, _, Phaser, promise, Utilities, Engine, Player, PointsManager, AssetsLoader, Scheduler, Storage) {
    'use strict';

    function Game() {
        this.firebasePlayers = undefined;
        this.firebasePoints = undefined;
        this.firebaseRafts = undefined;
        this.phaser = undefined;

        // Player from current browser.
        this.localPlayer = undefined;

        // List of players.
        this.players = [];

        // List of points.
        this.pointList = Engine.defaultPointList;

        var allMethods = _.functions(this);
        allMethods.unshift(this);
        _.bindAll.apply(_, allMethods);

        this.setupManager = new Scheduler();
        this.setupManager.addTask(this.loadAssets);
        this.setupManager.addTask(this.setupFirebase);
        this.setupManager.addTask(this.setupPhaser);
        this.setupManager.addTask(this.setupLocalPlayer);
        this.setupManager.addTask(this.setupFirebasePlayersEvents);
        this.setupManager.addTask(this.setupFirebasePointsEvents);

        this.setupManager.resolveAllTasks(function () {
            new PointsManager();
            console.info('Game loaded!');
        });
    }

    Game.prototype = {
        loadAssets: function () {
            var p = new promise.Promise();

            var images = [
                AssetsLoader.IMAGES.MONKEY,
                AssetsLoader.IMAGES.GROUND
            ];

            AssetsLoader.loadImages(images, function () {
                // console.log('Game#loadAssets');
                p.done();
            });

            return p;
        },

        setupFirebase: function () {
            var p = new promise.Promise();

            this.firebasePlayers = new Firebase('https://dumplings.firebaseio.com/firebase-players');
            this.firebasePoints = new Firebase('https://dumplings.firebaseio.com/firebase-points');
            this.firebaseRafts = new Firebase('https://dumplings.firebaseio.com/firebase-rafts');

            // console.log('Game#setupFirebase');
            p.done();
            return p;
        },

        setupPhaser: function () {
            var p = new promise.Promise();

            this.phaser = new Phaser.Game(Game.WIDTH + 100, Game.HEIGHT, Phaser.CANVAS, 'playground', Engine);

            // console.log('Game#setupPhaser');
            p.done();
            return p;
        },

        setupLocalPlayer: function () {
            // console.log('Game#setupLocalPlayer');
            var p = new promise.Promise();
            var playerID = Storage.get(Game.STORAGE_PLAYER_ID_KEY);

            if (playerID === null) {
                playerID = Utilities.guid();
                Storage.put(Game.STORAGE_PLAYER_ID_KEY, playerID);
            }

            console.warn('Hello Local Player (ID: %s)', playerID);
            this.localPlayer = new Player();
            this.localPlayer.data.id = playerID;

            // console.log('Game#setupLocalPlayer');
            p.done();
            return p;
        },

        setupFirebasePlayersEvents: function () {
            var p = new promise.Promise();
            var self = this;
            var currentPlayerID = Storage.get(Game.STORAGE_PLAYER_ID_KEY);

            this.firebasePlayers.child(currentPlayerID).once('value', function (snapshot) {
                var snap = snapshot.val();

                if (snap === null) {
                    self.firebasePlayers.child(currentPlayerID).set(self.localPlayer.data);
                } else {
                    self.localPlayer.data = snap;
                }
            });

            this.firebasePlayers.on('child_added', function (snapshot) {
                var snap = snapshot.val();
                console.info('players: child_added', snap);
                if (snap.id !== self.localPlayer.data.id) {
                    self.createPlayer(snap);
                }
            });

            this.firebasePlayers.on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                console.info('players: child_changed', snap);
                self.updatePlayerPosition(snap);
            });

            this.firebasePlayers.on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                console.info('players: child_removed', snap);
                self.removePlayerById(snap.id);
            });

            // console.log('Game#setupFirebasePlayersEvents');
            p.done();
            return p;
        },

        setupFirebasePointsEvents: function () {
            var p = new promise.Promise();
            var self = this;

            this.firebasePoints.on('child_added', function (snapshot) {
                var snap = snapshot.val();
                console.log('points: child_added', snap);
                var pointTile = self.phaser.add.tileSprite(32 * snap.x, 32 * snap.y, 32, 32, 'tile-ground', 3);
                Engine.pointGroup.add(pointTile);
            });

            this.firebasePoints.on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                console.log('points: child_changed', snap);
                var pointTile = self.phaser.add.tileSprite(32 * snap.x, 32 * snap.y, 32, 32, 'tile-ground', 3);
                Engine.pointGroup.add(pointTile);
            });

            p.done();
            return p;
        },

        createPlayer: function (params) {
            // console.log('Game#createPlayer', params);

            console.warn('Hello Player (ID: %s)', params.id);
            var player = new Player();
            player.data = params;

            this._createPhaserPlayer(player);
            Engine.playerGroup.add(player.phaser);

            this.players.push(player);
        },

        _createPhaserPlayer: function (player) {
            // console.log('Game#_createPhaserPlayer', player.toString());
            player.phaser = this.phaser.add.sprite(0, 32 * 8, 'tile-monkey');
            player.phaser.name = 'player';

            this.phaser.physics.enable(player.phaser, Phaser.Physics.ARCADE);

            player.phaser.body.bounce.y = 0;
            player.phaser.body.collideWorldBounds = true;
            player.phaser.body.setSize(12, 28, 10, 2);
            player.phaser.body.gravity.y = 350;

            player.label = this.phaser.add.text(0, 0, player.getName(), {
                font: "11px Arial",
                fill: "#000",
                align: "center"
            });
            player.label.name = 'label';
        },

        removePlayerById: function (playerID) {
            // console.log('Game#removePlayerById', playerID);
            if (this.localPlayer.data.id === playerID) {
                this.localPlayer.phaser.destroy();
                this.localPlayer.label.destroy();
            } else {
                _.each(this.players, function (player, index) {
                    if (player.data.id === playerID) {
                        player.phaser.destroy();
                        player.label.destroy();

                        // Remove from list of players.
                        this.players.splice(index, 1);
                    }
                }, this);
            }
        },

        updatePlayerPosition: function (params) {
            /// console.log('Game#updatePlayerPosition', params);

            if (this.localPlayer.data.id === params.id) {
                this.localPlayer.updatePosition(params);
            } else {
                _.each(this.players, function (player) {
                    if (player.data.id === params.id) {
                        player.updatePosition(params);
                    }
                }, this);
            }
        },

        updatePlayer: function (player) {
            player.updatePosition(player.data);
        },

        updateFirebasePlayer: function (player) {
            this.firebasePlayers.child(player.data.id).update(player.data);
        },

        updatePoints: function (points) {
            this.pointList = points;
        },

        updateFirebasePoints: function (points) {
            this.firebasePoints.set(points);
        },

        // Reset methods.
        // --------------

        resetPoints: function () {
            this.pointList = Engine.defaultPointList;
        },

        resetFirebasePoints: function () {
            this.firebasePoints.set(Engine.defaultPointList);
        },

        resetPlayers: function () {
            var playerSettings = _.clone(Player.DEFAULT_SETTINGS);

            playerSettings.id = this.localPlayer.data.id;
            this.localPlayer.data = playerSettings;

            _.each(this.players, function (player, index) {
                playerSettings.id = player.data.id;
                this.players[index].data = playerSettings;
            }, this);
        },

        resetFirebasePlayers: function () {
            var playerSettings = _.clone(Player.DEFAULT_SETTINGS);

            playerSettings.id = this.localPlayer.data.id;
            this.firebasePlayers.child(playerSettings.id).update(playerSettings);

            _.each(this.players, function (player) {
                playerSettings.id = player.data.id;
                this.firebasePlayers.child(playerSettings.id).update(playerSettings);
            }, this);
        },

        restore: function () {
            this.resetPoints();
            this.resetFirebasePoints();

            this.resetPlayers();
            this.resetFirebasePlayers();
        }
    };
    
    Game.WIDTH = 960;
    Game.HEIGHT = 320;
    
    Game.STORAGE_PLAYER_ID_KEY = 'ss15-dumplings-player-id';

    return Game;
});
