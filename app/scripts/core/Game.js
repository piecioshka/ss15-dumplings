define([
    'lodash',
    'backbone',
    'promise',
    'core/World',
    'core/Player',
    'core/Storage'
], function (_, Backbone, promise, World, Player, Storage) {
    'use strict';

    var Game = function () {
        _.extend(this, Backbone.Events);
        this._worlds = {};
        this._selectedWorldID = undefined;
        this._fb = undefined;

        console.info('Game was created at: %s', new Date());
    };

    /**
     * @param {World} world
     */
    Game.prototype.addWorld = function (world) {
        console.log('Game#addWorld', world);
        // 1. Aktualizujemy instancję.
        this._worlds[world.getID()] = world;
        world.setFirebaseConnection(this._fb.child(world.getID()));
    };

    Game.prototype.setupEvents = function () {
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

            _.each(_.keys(snap), function (worldID) {
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

        _.each(_.keys(this._worlds), function (worldID) {
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
        world.render();
    };

    /**
     * @param {Firebase} connection
     */
    Game.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    return Game;
});
