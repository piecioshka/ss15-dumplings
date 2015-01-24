define([
    'lodash',
    'backbone',
    'core/World'
], function (_, Backbone, World) {
    'use strict';

    var Game = function () {
        _.extend(this, Backbone.Events);
        this._worlds = {};
        this._fb = undefined;

        console.info('Game was created at: %s', new Date());
    };

    /**
     * @param {World} world
     */
    Game.prototype.addWorld = function (world) {
        this._worlds[world.getID()] = world;
        world.setFirebaseConnection(this._fb.child(world.getID()));
    };

    Game.prototype.fetchWorlds = function (cb) {
        this._fb.once('value', cb);
    };

    Game.prototype.setupEvents = function () {
        this._fb.on('child_removed', function () {
            location.reload(true);
        });
    };

    Game.prototype.loadWorlds = function () {
        var self = this;

        this.fetchWorlds(function (snapshot) {
            var snap = snapshot.val();

            _.each(_.keys(snap), function (worldID) {
                var world = new World();
                world.setID(worldID);

                self.addWorld(world);
            });
        });
    };

    Game.prototype.removeWorlds = function () {
        this._fb.remove(function (error) {
            if (error) {
                throw new Error('Synchronization failed');
            }
        });
    };

    Game.prototype.renderWorld = function (world) {
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
