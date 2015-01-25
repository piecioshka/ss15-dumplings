define([
    'lodash',
    'backbone',
    'phaser',
    'core/Utilities',
    'core/Storage'
], function (_, Backbone, Phaser, Utilities, Storage) {
    'use strict';

    /**
     * @param {number} x
     * @param {number} y
     * @constructor
     */
    var Player = function (x, y) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();

        this.x = x;
        this.y = y;

        this._score = 0;

        this._phaser = undefined;
        this._fb = undefined;
    };

    /**
     * @returns {string}
     */
    Player.prototype.getID = function () {
        return this._id;
    };

    /**
     * @param {string} id
     */
    Player.prototype.setID = function (id) {
        this._id = id;
    };

    Player.prototype.destroy = function () {
        console.log('Player#destroy');
        // 1. Usunąć z Phaser.
        // 2. Usuwamy playera ze storage-a
        Storage.del(Player.STORAGE_KEY);
        // 3. Usuwamy z Firebase
        this._fb.remove();
    };

    Player.prototype.sync = function () {
        // 1. Wysłać do Firebase
        this._fb.update({
            x: this.x,
            y: this.y,
            score: this._score
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
     * @param {boolean} [silent=false]
     */
    Player.prototype.addCollectedPoints = function (point, silent) {
        // 1. Aktualizacja instancji
        this._score += point.getValue();

        if (silent) return;

        // 2. Synchronizacja z Firebase
        this.sync();

        console.info('Player #%s add points: %s. Current collected points: ', this._id, point.getValue(), this._score);
    };

    /**
     * @param {Firebase} connection
     */
    Player.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    Player.prototype.setCameraOnIt = function (phaser) {
        phaser.camera.follow(this._phaser);
    };

    Player.prototype.render = function (phaser, playersPhaser) {
        // console.log('Player#render');
        this._phaser = phaser.add.sprite(32 * this.x, 32 * this.y, 'tile-monkey');
        this._phaser.id = this._id;

        phaser.physics.enable(this._phaser, Phaser.Physics.ARCADE);

        this._phaser.body.bounce.y = 0;
        this._phaser.body.collideWorldBounds = true;
        this._phaser.body.setSize(12, 28, 10, 2);
        this._phaser.body.gravity.y = 350;

        // 2. Dodajemy do grupy Phaser
        playersPhaser.add(this._phaser);
    };

    Player.prototype.update = function (phaser, cursors, jumpButton) {
        // console.log('Player#update');
        this._phaser.body.velocity.x = 0;

        if (cursors.left.isDown) {
            this._phaser.body.velocity.x = -150;
        } else if (cursors.right.isDown) {
            this._phaser.body.velocity.x = 150;
        }

        if (jumpButton.isDown && this._phaser.body.onFloor()) {
            this._phaser.body.velocity.y = -300;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------

    Player.EVENTS = {
        CHANGE_POSITION: 'change:position',
        ADD_POINTS: 'add:points'
    };

    Player.STORAGE_KEY = 'ss15-dumplings-player';

    return Player;
});
