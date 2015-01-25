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
     * @param {string} [figure=ScorePoint.ANGULAR]
     * @constructor
     */
    var ScorePoint = function (x, y, value, figure) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();
        this.x = x;
        this.y = y;
        this._value = value || 1;
        this._figure = figure || ScorePoint.ANGULAR;

        this._phaser = undefined;
        this._fb = undefined;
    };

    /**
     * @returns {string}
     */
    ScorePoint.prototype.getID = function () {
        return this._id;
    };

    /**
     * @param {number} id
     */
    ScorePoint.prototype.setID = function (id) {
        this._id = id;
    };

    ScorePoint.prototype.setFigure = function (figure) {
        this._figure = figure;
    };

    /**
     * @param {boolean} [silent=false]
     */
    ScorePoint.prototype.destroy = function (silent) {
        // 1. Usunąć z Phaser.
        try {
            this._phaser.destroy();
        } catch (e) {
            console.log('ScorePoint#destroy');
        }

        if (silent) return;

        // 2. Usunąć z Firebase
        this._fb.remove();
    };

    /**
     * @returns {number}
     */
    ScorePoint.prototype.getValue = function () {
        return this._value;
    };

    ScorePoint.prototype.sync = function () {
        // console.log('ScorePoint#sync');
        this._fb.update({
            id: this._id,
            x: this.x,
            y: this.y,
            value: this._value,
            figure: this._figure
        });
    };

    /**
     * @param {Firebase} connection
     */
    ScorePoint.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    ScorePoint.prototype.render = function (phaser, pointsPhaser) {
        // console.log('ScorePoint#render');
        this._phaser = phaser.add.tileSprite(this.x, this.y, 32, 32, this._figure, 3);
        this._phaser.id = this._id;

        phaser.physics.enable(this._phaser, Phaser.Physics.ARCADE);

        this._phaser.body.bounce.y = 0;
        this._phaser.body.collideWorldBounds = true;
        this._phaser.body.setSize(32, 32, 0, 0);
        this._phaser.body.gravity.y = 350;

        // 2. Dodajemy do grupy Phaser
        pointsPhaser.add(this._phaser);
    };

    ScorePoint.ANGULAR = 'tool-angular';
    ScorePoint.BOOTSTRAP = 'tool-bootstrap';
    ScorePoint.CSS3 = 'tool-css3';
    ScorePoint.GULP = 'tool-gulp';
    ScorePoint.HTML5 = 'tool-html5';
    ScorePoint.SASS = 'tool-sass';

    return ScorePoint;
});
