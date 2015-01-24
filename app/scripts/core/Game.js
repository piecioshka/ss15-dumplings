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

        // List of players.
        this.players = [];
        this.localPlayer = undefined;

        _.bindAll(this, 'setupLocalPlayer', 'setupFirebase', 'setupPhaser', 'setupHandlers', 'restore');

        this.setupManager = new Scheduler();
        this.setupManager.addTask(this.loadAssets);
        this.setupManager.addTask(this.setupFirebase);
        this.setupManager.addTask(this.setupPhaser);
        this.setupManager.addTask(this.setupLocalPlayer);
        this.setupManager.addTask(this.setupHandlers);

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
                console.log('Game#loadAssets');
                p.done();
            });

            return p;
        },

        setupFirebase: function () {
            var p = new promise.Promise();

            this.firebasePlayers = new Firebase('https://dumplings.firebaseio.com/firebase-players');
            this.firebasePoints = new Firebase('https://dumplings.firebaseio.com/firebase-points');
            this.firebaseRafts = new Firebase('https://dumplings.firebaseio.com/firebase-rafts');

            console.log('Game#setupFirebase');
            p.done();
            return p;
        },

        setupPhaser: function () {
            var p = new promise.Promise();

            this.phaser = new Phaser.Game(Game.WIDTH + 100, Game.HEIGHT, Phaser.CANVAS, 'playground', Engine);

            console.log('Game#setupPhaser');
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

            console.log('Game#setupLocalPlayer');
            p.done();
            return p;
        },

        setupHandlers: function () {
            var p = new promise.Promise();
            var self = this;
            var currentPlayerID = this.getLocalPlayerID();

            this.firebasePlayers.child(currentPlayerID).once('value', function (snapshot) {
                var snap = snapshot.val();

                if (snap !== null) {
                    self.localPlayer.data = snap;
                } else {
                    self.firebasePlayers.child(currentPlayerID).set(self.localPlayer.data);
                }
            });

            this.firebasePlayers.on('child_added', function (snapshot) {
                var snap = snapshot.val();
                if (snap.id !== self.localPlayer.data.id) {
                    // console.info('child_added', snap);
                    self.createPlayer(snap);
                }
            });

            this.firebasePlayers.on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                // console.info('child_changed', snap);
                self.updatePlayerPosition(snap);
            });

            this.firebasePlayers.on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                // console.info('child_removed', snap);
                self.removePlayerById(snap.id);
            });

            console.log('Game#setupHandlers');
            p.done();
            return p;
        },

        createPlayer: function (params) {
            // console.log('Game#createPlayer', params);

            console.warn('Hello Player (ID: %s)', params.id);
            var player = new Player();
            player.data = params;

            this._createPhaserPlayer(player);
            this.players.push(player);
            Engine.playerGroup.add(player.phaser);
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

            _.each(this.players, function (player) {
                if (player.data.id === params.id) {
                    player.updatePosition(params);
                }
            }, this);

            if (this.localPlayer.data.id === params.id) {
                this.localPlayer.updatePosition(params);
            }
        },

        updatePlayer: function (player) {
            player.updatePosition(player.phaser);

            // console.log('Game#updatePlayer', player);
            this.firebasePlayers.child(player.data.id).update(player.data);
        },

        updatePoints: function () {
            this.firebasePoints.set(Engine.tileList);
        },

        getLocalPlayerID: function () {
            return Storage.get(Game.STORAGE_PLAYER_ID_KEY);
        },

        restore: function () {
            var playerSettings = Player.DEFAULT_SETTINGS;

            playerSettings.id = this.localPlayer.data.id;
            this.firebasePlayers.child(playerSettings.id).update(playerSettings);

            _.each(this.players, function (player) {
                playerSettings.id = player.data.id;
                this.firebasePlayers.child(player.data.id).update(playerSettings);
            }, this);

            this.firebasePoints.set(Engine.defaultPointList);
        }
    };
    
    Game.WIDTH = 960;
    Game.HEIGHT = 320;
    
    Game.STORAGE_PLAYER_ID_KEY = 'ss15-dumplings-player-id';

    return Game;
});
