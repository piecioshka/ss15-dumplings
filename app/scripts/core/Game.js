define([
    'lodash',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var Game = function () {
        _.extend(this, Backbone.Events);
        this._worlds = {};
        this._fb = undefined;
    };

    /**
     * @param {World} world
     */
    Game.prototype.addWorld = function (world) {
        this._worlds[world.getID()] = world;
        world.setFirebaseConnection(this._fb.child(world.getID()));
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
