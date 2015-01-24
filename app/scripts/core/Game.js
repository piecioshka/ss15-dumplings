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
        this.setupManager.addTask(this.setupLocalPlayer);
        this.setupManager.addTask(this.setupCommunication);
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

        setupLocalPlayer: function () {
            console.log('Game#setupLocalPlayer');
            var p = new promise.Promise();
            var playerID = Storage.get(Game.STORAGE_PLAYER_ID_KEY);

            if (playerID === null) {
                playerID = Utilities.guid();
                Storage.put(Game.STORAGE_PLAYER_ID_KEY, playerID);
            }

            this.localPlayer = new Player();
            this.localPlayer.firebase.id = playerID;

            // console.warn('Hello Local Player (ID: %s)', playerID);

            p.done();
            return p;
        },

        setupCommunication: function () {
            var p = new promise.Promise();

            this.firebase = new Firebase('https://dumplings.firebaseio.com/firebase');
            this.phaser = new Phaser.Game(Game.WIDTH, Game.HEIGHT, Phaser.CANVAS, 'playground', Engine);

            p.done();
            return p;
        },

        setupHandlers: function () {
            var p = new promise.Promise();
            var self = this;
            var currentPlayerID = this.getLocalPlayerID();

            this.firebase.child(currentPlayerID).once('value', function (snapshot) {
                var snap = snapshot.val();

                console.log('snap', snap);

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
            console.log('Game#createPlayer', params);
            var player = new Player();
            player.firebase = params;
            console.warn('Hello Player (ID: %s)', player.firebase.id);

            this._createPhaserPlayer(player);
            this.players.push(player);
        },

        _createPhaserPlayer: function (player) {
            // console.log('Game#_createPhaserPlayer', player.toString());
            player.phaser = this.phaser.add.sprite(0, 10, 'tile-monkey');
            this.phaser.physics.enable(player.phaser, Phaser.Physics.ARCADE);

            player.phaser.body.bounce.y = 0.1;
            player.phaser.body.collideWorldBounds = true;
            player.phaser.body.setSize(24, 28, 4, 2);
            player.phaser.body.gravity.y = 350;

            player.label = this.phaser.add.text(0, 0, player.getName(), {
                font: "11px Arial",
                fill: "#000",
                align: "center"
            });
        },

        removePlayerById: function (playerID) {
            console.log('Game#removePlayerById', playerID);
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
                    player.phaser.x = player.x;
                    player.phaser.y = player.y;
                }
            }, this);
        },

        updatePlayer: function (player) {
            player.label.x = player.phaser.x;
            player.label.y = player.phaser.y - 10;

            player.firebase.x = player.phaser.x;
            player.firebase.y = player.phaser.y;

            // console.log('Game#updatePlayer', player);
            this.firebase.child(player.firebase.id).update(player.firebase);
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
