define([
    'lodash',
    'backbone',
    'core/Utilities'
], function (_, Backbone, Utilities) {
    'use strict';

    var Point = function (x, y, value) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();
        this.x = x;
        this.y = y;
        this._value = value || 1;

        this._phaser = undefined;
        this._fb = undefined;
    };

    /**
     * @returns {string}
     */
    Point.prototype.getID = function () {
        return this._id;
    };

    Point.prototype.destroy = function () {
        // 1. Usunąć z Phaser.
    };

    Point.prototype.getValue = function () {
        return this._value;
    };

    Point.prototype.sync = function () {
        this._fb.update({
            id: this._id
        });
    };

    /**
     * @param {Firebase} connection
     */
    Point.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    return Point;
});
