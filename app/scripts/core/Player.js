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
     * @param {string} figure
     * @constructor
     */
    var Player = function (x, y, figure) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();

        this.x = x;
        this.y = y;

        this._score = 0;
        this._figure = figure || Player.YEOMAN;

        this._phaser = undefined;
        this._fb = undefined;
        this.label = undefined;
    };

    Player.LABEL_DISTANCE = 18;
    Player.LABEL_STYLE = {
        font: '11px Tahoma',
        fill: '#F00',
        align: 'center'
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
        // console.log('Player#destroy');
        // 1. Usunąć z Phaser.
        try {
            this._phaser.destroy();
        } catch (e) {
            console.log('Player#destroy');
        }
        // 2. Usuwamy playera ze storage-a
        Storage.del(Player.STORAGE_KEY);
        // 3. Usuwamy z Firebase
        this._fb.remove();
    };

    Player.prototype.sync = function () {
        // console.log('Player#sync');
        // 1. Wysłać do Firebase
        this._fb.update({
            id: this._id,
            x: this.x,
            y: this.y,
            score: this._score,
            figure: this._figure
        });
    };

    /**
     * @param {number} x
     * @param {number} y
     * @param {boolean} [silent=false]
     */
    Player.prototype.setPosition = function (x, y, silent) {
        // console.log('Player#setPosition', x, y, silent);
        var isPositionChanged = (this.x !== x) || (this.y !== y);
        // console.log('isPositionChanged', isPositionChanged);

        // 1. Aktualizacja instancji
        this.x = x;
        this.y = y;
        this._label.x = x;
        this._label.y = (y - Player.LABEL_DISTANCE);

        if (silent) {
            // 2. Aktualizacja na Phaser
            if (this._phaser) {
                // Jeśli player został wyrenderowany.
                this._phaser.x = x;
                this._phaser.y = y;
            }
        } else {
            // 2. Aktualizacja w Firebase
            if (isPositionChanged) {
                // Jeśli pozycja playera się zmieni.
                this.sync();
            }
        }
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

        // console.info('Player #%s add points: %s. Current collected points: ', this._id, point.getValue(), this._score);
    };

    /**
     * @param {number} score
     */
    Player.prototype.setScore = function (score) {
        // 1. Aktualizacja instancji
        this._score = score;
    };

    /**
     * @param {string} figure
     */
    Player.prototype.setFigure = function (figure) {
        // 1. Aktualizacja instancji
        this._figure = figure;
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
        if (!this._figure) {
            throw new Error('figure is not set');
        }

        this._phaser = phaser.add.sprite(this.x, this.y, this._figure);
        this._phaser.id = this._id;
        this._phaser.x = this.x;
        this._phaser.y = this.y;

        this._label = phaser.add.text(this.x, (this.y - Player.LABEL_DISTANCE), this.getNick(), Player.LABEL_STYLE);

        var localPlayerID = Storage.get(Player.STORAGE_KEY);

        // Grawitacja tylko dla lokalnego playera
        if (this._id === localPlayerID) {
            phaser.physics.enable(this._phaser, Phaser.Physics.ARCADE);

            this._phaser.body.bounce.y = 0;
            this._phaser.body.collideWorldBounds = true;
            this._phaser.body.setSize(28, 32, 2, 0);
            this._phaser.body.gravity.y = 350;
        }

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

        // 2. Aktualizacja w Firebase
        this.setPosition(Math.round(this._phaser.x), Math.round(this._phaser.y));
    };

    Player.prototype.getNick = function () {
        return this._id;
    };

    /**
     * @returns {number}
     */
    Player.prototype.getScore = function () {
        return this._score || 0;
    };

    Player.GRUNT = 'tool-grunt';
    Player.YEOMAN = 'tool-yeoman';
    Player.BOWER = 'tool-bower';

    Player.STORAGE_KEY = 'ss15-dumplings-player';

    return Player;
});
