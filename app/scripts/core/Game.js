define([
    'firebase',
    'jquery',
    'lodash',
    'phaser',
    'promise',
    'core/Utilities',
    'core/Engine',
    'core/Player',
    'core/helpers/AssetsLoader',
    'core/helpers/Scheduler',
    'core/helpers/Storage'
], function (Firebase, $, _, Phaser, promise, Utilities, Engine, Player, AssetsLoader, Scheduler, Storage) {
    'use strict';

    function Game() {
        this.firebase = undefined;
        this.phaser = undefined;

        // List of players.
        this.players = [];
        this.localPlayer = undefined;

        _.bindAll(this, 'setupLocalPlayer', 'setupCommunication', 'setupHandlers');

        this.setupManager = new Scheduler();
        this.setupManager.addTask(this.loadAssets);
        this.setupManager.addTask(this.setupCommunication);
        this.setupManager.addTask(this.setupLocalPlayer);
        this.setupManager.addTask(this.setupHandlers);

        this.setupManager.resolveAllTasks(function () {
            // console.info('Game loaded!');
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
                p.done();
            });

            return p;
        },

        setupCommunication: function () {
            var p = new promise.Promise();

            this.firebase = new Firebase('https://dumplings.firebaseio.com/firebase');
            this.points = new Firebase('https://dumplings.firebaseio.com/points');
            this.phaser = new Phaser.Game(Game.WIDTH + 100, Game.HEIGHT, Phaser.CANVAS, 'playground', Engine);

            p.done();
            return p;
        },

        setupLocalPlayer: function () {
            console.log('Game#setupLocalPlayer');
            var p = new promise.Promise();
            var playerID = Storage.get(Game.STORAGE_PLAYER_ID_KEY);

            if (playerID === null) {
                playerID = Utilities.guid();
                Storage.put(Game.STORAGE_PLAYER_ID_KEY, playerID);
            }

            console.warn('Hello Local Player (ID: %s)', playerID);
            this.localPlayer = new Player();
            this.localPlayer.firebase.id = playerID;

            p.done();
            return p;
        },

        setupHandlers: function () {
            var p = new promise.Promise();
            var self = this;
            var currentPlayerID = this.getLocalPlayerID();

            this.firebase.child(currentPlayerID).once('value', function (snapshot) {
                var snap = snapshot.val();

                if (snap !== null) {
                    self.localPlayer.firebase = snap;
                } else {
                    self.firebase.child(currentPlayerID).set(self.localPlayer.firebase);
                }
            });

            this.firebase.on('child_added', function (snapshot) {
                var snap = snapshot.val();
                if (snap.id !== self.localPlayer.firebase.id) {
                    // console.info('child_added', snap);
                    self.createPlayer(snap);
                }
            });

            this.firebase.on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                // console.info('child_changed', snap);
                self.updatePlayerPosition(snap);
            });

            this.firebase.on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                // console.info('child_removed', snap);
                self.removePlayerById(snap.id);
            });

            p.done();
            return p;
        },

        createPlayer: function (params) {
            // console.log('Game#createPlayer', params);

            console.warn('Hello Player (ID: %s)', params.id);
            var player = new Player();
            player.firebase = params;

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
            if (this.localPlayer.firebase.id === playerID) {
                this.localPlayer.phaser.destroy();
                this.localPlayer.label.destroy();
            } else {
                _.each(this.players, function (player, index) {
                    if (player.firebase.id === playerID) {
                        player.phaser.destroy();
                        player.label.destroy();

                        // Remove from list of players.
                        this.players.splice(index, 1);
                    }
                }, this);
            }
        },

        updatePlayerPosition: function (params) {
            // console.log('Game#updatePlayerPosition', params);
            _.each(this.players, function (player) {
                if (player.firebase.id === params.id) {
                    player.updatePosition(params);
                }
            }, this);
        },

        updatePlayer: function (player) {
            player.updatePosition(player.phaser);

            // console.log('Game#updatePlayer', player);
            this.firebase.child(player.firebase.id).update(player.firebase);
        },

        getPoints: function () {
            this.points.on('value', function (snapshot) {
                Engine.tileList = snapshot.val();
            });
        },

        updatePoints: function () {
            this.points.set(Engine.tileList);
        },

        getLocalPlayerID: function () {
            return Storage.get(Game.STORAGE_PLAYER_ID_KEY);
        }
    };
    
    Game.WIDTH = 960;
    Game.HEIGHT = 320;
    
    Game.STORAGE_PLAYER_ID_KEY = 'ss15-dumplings-player-id';

    return Game;
});
