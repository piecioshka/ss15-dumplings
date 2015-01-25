define([
    'lodash',
    'backbone',
    'phaser',
    'core/Utilities'
], function (_, Backbone, Phaser, Utilities) {
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

    /**
     * @param {boolean} [silent=false]
     */
    Point.prototype.destroy = function (silent) {
        // 1. Usunąć z Phaser.
        try {
            this._phaser.destroy();
        } catch (e) {
            console.log('Point#destroy');
        }

        if (silent) return;

        // 2. Usunąć z Firebase
        this._fb.remove();
    };

    /**
     * @returns {number}
     */
    Point.prototype.getValue = function () {
        return this._value;
    };

    Point.prototype.sync = function () {
        // console.log('Point#sync');
        this._fb.update({
            id: this._id,
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

    Point.prototype.render = function (phaser, pointsPhaser) {
        // console.log('Point#render');
        this._phaser = phaser.add.tileSprite(this.x, this.y, 32, 32, 'tile-ground', 3);
        this._phaser.id = this._id;

        phaser.physics.enable(this._phaser, Phaser.Physics.ARCADE);

        this._phaser.body.bounce.y = 0;
        this._phaser.body.collideWorldBounds = true;
        this._phaser.body.setSize(32, 32, 0, 0);
        this._phaser.body.gravity.y = 350;

        // 2. Dodajemy do grupy Phaser
        pointsPhaser.add(this._phaser);
    };

    return Point;
});
