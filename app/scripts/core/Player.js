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

        this._name = Player.DEFAULT_NAME;
        this._score = 0;
        this._figure = figure || Player.YEOMAN;

        this._phaser = undefined;
        this._fb = undefined;
        this._label = undefined;
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

    /**
     * @returns {string}
     */
    Player.prototype.getName = function () {
        return this._name;
    };

    /**
     * @param {string} name
     */
    Player.prototype.setName = function (name) {
        this._name = name || Player.DEFAULT_NAME;
    };

    Player.prototype.isDefaultName = function () {
        return this._name === Player.DEFAULT_NAME;
    };

    /**
     * @returns {number}
     */
    Player.prototype.getScore = function () {
        return this._score || 0;
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

    Player.prototype.destroy = function () {
        // console.log('Player#destroy');
        // 1. Usunąć z Phaser.
        if (this._phaser) {
            // Może się jeszcze nie wyrenderował (ktoś kliknął Anuluj).
            this._phaser.destroy();
        }
        // 2. Usunąć label z Phaser-a
        if (this._label) {
            // Może się jeszcze nie wyrenderował (ktoś kliknął Anuluj).
            this._label.destroy();
        }
        // 3. Usuwamy z Firebase
        if (this._fb) {
            // Może się jeszcze nie wyrenderował (ktoś kliknął Anuluj).
            this._fb.remove();
        }
    };

    Player.prototype.sync = function () {
        // console.log('Player#sync');
        // 1. Wysłać do Firebase
        this._fb.update({
            id: this._id,
            x: this.x,
            y: this.y,
            name: this._name,
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
     * @param {ScorePoint} scorePoint
     * @param {boolean} [silent=false]
     */
    Player.prototype.addCollectedPoints = function (scorePoint, silent) {
        // 1. Aktualizacja instancji
        this._score += scorePoint.getValue();

        if (silent) return;

        // 2. Synchronizacja z Firebase
        this.sync();

        // console.info('Player #%s add points: %s. Current collected points: ', this._id, scorePoint.getValue(), this._score);
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

        this._label = phaser.add.text(this.x, (this.y - Player.LABEL_DISTANCE), this.getName(), Player.LABEL_STYLE);

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


    Player.GRUNT = 'tool-grunt';
    Player.YEOMAN = 'tool-yeoman';
    Player.BOWER = 'tool-bower';

    Player.DEFAULT_NAME = 'noname';
    Player.STORAGE_KEY = 'ss15-dumplings-player';

    Player.LABEL_DISTANCE = 18;
    Player.LABEL_STYLE = {
        font: '11px Tahoma',
        fill: '#F00',
        align: 'center'
    };

    return Player;
});
