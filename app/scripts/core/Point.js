define([
    'lodash',
    'backbone',
    'core/Utilities'
], function (_, Backbone, Utilities) {
    'use strict';

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} [value=1]
     * @constructor
     */
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

    /**
     * @param {number} id
     */
    Point.prototype.setID = function (id) {
        this._id = id;
    };

    Point.prototype.destroy = function () {
        // 1. Usunąć z Phaser.
    };

    /**
     * @returns {number}
     */
    Point.prototype.getValue = function () {
        return this._value;
    };

    Point.prototype.sync = function () {
        this._fb.update({
            x: this.x,
            y: this.y,
            value: this._value
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
