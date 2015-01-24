define([
    'firebase',
    'jquery',
    'lodash',
    'phaser',
    'promise',
    'Utilities',
    'Engine',
    'helpers/AssetsLoader',
    'helpers/Scheduler',
    'helpers/Storage'
], function (Firebase, $, _, Phaser, promise, Utilities, Engine, AssetsLoader, Scheduler, Storage) {
    'use strict';

    function Game() {
        this.players = undefined;
        this.game = undefined;

        this.setupManager = new Scheduler();
        this.setupManager.addTask(this.loadAssets);
        this.setupManager.addTask(this.initialize.bind(this));

        this.setupManager.resolveAllTasks(function () {
            console.info('Game loaded!');
        });
    }

    Game.prototype = {
        loadAssets: function () {
            var p = new promise.Promise();

            var images = [
                'assets/images/monkey.png'
            ];

            AssetsLoader.loadImages(images, function () {
                p.done();
            });

            return p;
        },

        initialize: function () {
            var p = new promise.Promise();

            this.players = new Firebase('https://dumplings.firebaseio.com/players');
            // this.phaser = new Phaser.Game(Game.WIDTH, Game.HEIGHT, Phaser.CANVAS, 'game', Engine);

            this.bindHandlers();
            this.setupPlayerID();

            p.done();

            return p;
        },

        bindHandlers: function () {
            var self = this;
            var currentPlayerID = this.getPlayerID();

            var localPlayer = {
                id: currentPlayerID,
                x: 10,
                y: 10
            };

            this.players.child(currentPlayerID).once('value', function (snapshot) {
                if (snapshot.val() !== null) {
                    localPlayer = snapshot.val();
                } else {
                    self.players.child(currentPlayerID).set(localPlayer);
                }
            });

            $('body').keydown(function (key) {
                if (key.keyCode == 38) { // top
                    localPlayer.y = localPlayer.y - 10;
                } else if (key.keyCode == 37) { // left
                    localPlayer.x = localPlayer.x - 10;
                } else if (key.keyCode == 39) { // right
                    localPlayer.x = localPlayer.x + 10;
                } else if (key.keyCode == 40) { // down
                    localPlayer.y = localPlayer.y + 10;
                }

                if (_.contains([37, 38, 39, 40], key.keyCode)) {
                    self.updatePlayer(currentPlayerID, localPlayer);
                }
            });

            this.players.on('child_added', function (snapshot) {
                var snap = snapshot.val();
                var $player = $("<player id='" + snap.id + "' style='top:" + snap.y + "px; left:" + snap.x + "px;'>");
                $("playground").append($player);
            });

            this.players.on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                $("#" + snap.id).animate({ top: snap.y, left: snap.x }, 0);
            });

            this.players.on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                $("#" + snap.id).remove();
            });

        },

        updatePlayer: function (playerID, localPlayer) {
            this.players.child(playerID).update(localPlayer);
        },

        setupPlayerID: function () {
            var playerID;

            if (Storage.get(Game.STORAGE_PLAYER_ID_KEY) === null) {
                playerID = Utilities.guid();
                Storage.put(Game.STORAGE_PLAYER_ID_KEY, playerID);
                console.warn('Hello new Player (ID: %s)', playerID);
            }
        },

        getPlayerID: function () {
            return Storage.get(Game.STORAGE_PLAYER_ID_KEY);
        }
    };
    
    Game.WIDTH = 1400;
    Game.HEIGHT = 500;
    
    Game.STORAGE_PLAYER_ID_KEY = 'playerId';

    return Game;
});
