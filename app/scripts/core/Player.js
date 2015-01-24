define([
    'lodash',
    'backbone',
    'core/Utilities'
], function (_, Backbone, Utilities) {
    'use strict';

    var Player = function (x, y) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();

        this.x = x;
        this.y = y;

        this._collectedPoints = 0;

        this._phaser = undefined;
        this._fb = undefined;
    };

    /**
     * @returns {string}
     */
    Player.prototype.getID = function () {
        return this._id;
    };

    Player.prototype.setID = function (id) {
        this._id = id;
    };

    Player.prototype.destroy = function () {
        // 1. Usunąć z Phaser.
    };

    Player.prototype.sync = function () {
        // 1. Wysłać do Firebase
        this._fb.update({
            x: this.x,
            y: this.y
        });
    };

    /**
     * @param {number} x
     * @param {number} y
     * @param {boolean} [silent=false]
     */
    Player.prototype.setPosition = function (x, y, silent) {
        // 1. Aktualizacja instancji
        this.x = x;
        this.y = y;

        if (silent) return;

        // 2. Uruchomienie zdarzenia `change:position`.
        this.trigger(Player.EVENTS.CHANGE_POSITION);
    };

    /**
     * @param {Point} point
     */
    Player.prototype.addCollectedPoints = function (point) {
        // 1. Aktualizacja instancji
        this._collectedPoints += point.getValue();

        // 2. Uruchomienie zdarzenia `change:position`.
        this.trigger(Player.EVENTS.CHANGE_POSITION);
    };

    /**
     * @param {Firebase} connection
     */
    Player.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    // -----------------------------------------------------------------------------------------------------------------

    Player.EVENTS = {
        CHANGE_POSITION: 'change:position'
    };

    return Player;
});
