define([
    'lodash',
    'backbone',
    'promise',
    'core/World',
    'core/Player'
], function (_, Backbone, promise, World, Player) {
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
        // 1. Aktualizujemy instancję.
        this._worlds[world.getID()] = world;
        world.setFirebaseConnection(this._fb.child(world.getID()));
    };

    Game.prototype.setupEvents = function () {
        this._fb.on('child_removed', function () {
            location.reload(true);
        });
    };

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

    Game.prototype.selectWorld = function (stage) {
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
        world.addPlayer(new Player(5, 5));
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
