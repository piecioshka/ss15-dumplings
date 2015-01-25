define([
    'lodash',
    'backbone',
    'promise',
    'phaser',
    'core/Configuration',
    'core/World',
    'core/Player',
    'core/Storage'
], function (_, Backbone, promise, Phaser, Configuration, World, Player, Storage) {
    'use strict';

    var Game = function () {
        _.extend(this, Backbone.Events);
        this._worlds = {};
        this._selectedWorldID = undefined;
        this._fb = undefined;
        this._phaser = new Phaser.Game(Configuration.WINDOW_WIDTH, Configuration.WINDOW_HEIGHT, Phaser.CANVAS, 'playground', {
            preload: this.loadAssets.bind(this),
            create: this.render.bind(this),

            update: function () {
                console.log('update');
            },

            render: function () {
                console.log('render');
            }
        });

        console.info('Game was created at: %s', new Date());
    };

    Game.prototype.loadAssets = function () {
        this._phaser.load.spritesheet('tile-ground', 'assets/images/tile-ground.png', 32, 32);
        this._phaser.load.image('tile-monkey', 'assets/images/tile-monkey.png');
        this._phaser.load.tilemap('map', 'assets/maps/map-1.json', null, Phaser.Tilemap.TILED_JSON);
    };

    /**
     * @param {World} world
     */
    Game.prototype.addWorld = function (world) {
        // console.log('Game#addWorld', world);
        // 1. Aktualizujemy instancję.
        this._worlds[world.getID()] = world;
        // 2. Ustawiamy połączenie Firebase
        world.setFirebaseConnection(this._fb.child(world.getID()));
    };

    Game.prototype.setupEvents = function () {
        // Jeśli usunęliśmy jakiś świat z gry, to restartujemy całą gre.
        this._fb.on('child_removed', function () {
            location.reload(true);
        });
    };

    /**
     * @param {Function} cb
     */
    Game.prototype.fetchWorlds = function (cb) {
        var self = this;

        this._fb.once('value', function (snapshot) {
            var snap = snapshot.val();

            var callbacks = [];

            _.each(snap, function (remoteWorld, worldID) {
                var p = new promise.Promise();
                var snapWorld = snap[worldID];

                var world = new World(snapWorld.stage);
                world.setID(worldID);
                world.setMap(snapWorld.map, true);

                self.addWorld(world);

                world.loadChildren(function () {
                    p.done();
                });

                callbacks.push(p);
            });

            promise.join(callbacks).then(cb);
        });
    };

    /**
     * @param {number} stage
     */
    Game.prototype.selectWorld = function (stage) {
        var cachedSelectedWorldID = this._selectedWorldID;

        delete this._selectedWorldID;

        _.each(this._worlds, function (worldInstance, worldID) {
            var world = this._worlds[worldID];

            if (world.getStage() !== stage) {
                return;
            }

            this._selectedWorldID = worldID;
        }, this);

        if (!this._selectedWorldID) {
            throw new Error('Sorry, we could not load world with stage: ' + stage);
        }

        if (cachedSelectedWorldID && cachedSelectedWorldID !== this._selectedWorldID) {
            var world = this._worlds[this._selectedWorldID];

            if (world) {
                var player = world.getPlayerByID(Storage.get(Player.STORAGE_KEY));

                if (player) {
                    world.removePlayer(player);
                }
            }
        }
    };

    Game.prototype.removeWorlds = function () {
        this._fb.remove(function (error) {
            if (error) {
                throw new Error('Synchronization failed');
            }
        });
    };

    Game.prototype.renderSelectedWorld = function () {
        var world = this._worlds[this._selectedWorldID];
        var playerID = Storage.get(Player.STORAGE_KEY);
        var localPlayer = new Player(5, 5);

        if (_.isEmpty(playerID)) {
            Storage.put(Player.STORAGE_KEY, localPlayer.getID());
        } else {
            localPlayer.setID(playerID);
        }

        world.addPlayer(localPlayer);
        world.render(this._phaser);
    };

    /**
     * @param {Firebase} connection
     */
    Game.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    Game.prototype.render = function () {
        this._phaser.physics.startSystem(Phaser.Physics.ARCADE);
        this._phaser.stage.backgroundColor = '#fff';
    };

    return Game;
});
