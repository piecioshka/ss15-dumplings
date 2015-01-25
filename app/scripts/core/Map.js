define([
    'lodash',
    'backbone',
    'firebase',
    'phaser',
    'core/Utilities',
    'core/Storage',
    'core/Player',
    'core/ScorePoint'
], function (_, Backbone, Firebase, Phaser, Utilities, Storage, Player, ScorePoint) {
    'use strict';

    /**
     * @param {number} stage
     * @constructor
     */
    var Map = function (stage) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();

        this._path = '';
        this._stage = stage;

        this._scorePoints = {};
        this._scorePointsPhaser = undefined;

        this._players = {};
        this._playersPhaser = undefined;

        this._phaser = undefined;
        this._fb = undefined;

        this._worldPhaser = undefined;
    };

    /**
     * @param {string} path
     * @param {boolean} [silent=false]
     */
    Map.prototype.setPath = function (path, silent) {
        // 1. Aktualizujemy instancję.
        this._path = path;

        if (silent) return;

        // 2. Aktualizujemy pozycję w Firebase
        this._fb.update({
            path: this._path,
            stage: this._stage
        });
    };

    /**
     * @param {ScorePoint} scorePoint
     */
    Map.prototype.addScorePoint = function (scorePoint) {
        // console.log('Map#addScorePoint', scorePoint);
        // 1. Aktualizujemy instancję.
        this._scorePoints[scorePoint.getID()] = scorePoint;
        // 2. Dodajemy do grupy Phaser
        // 3. Ustawiamy połączenie Firebase
        scorePoint.setFirebaseConnection(this._fb.child('/scorePoints/' + scorePoint.getID()));
        // 4. Aktualizujemy pozycję w Firebase
        scorePoint.sync();
    };

    /**
     * @param {ScorePoint} scorePoint
     * @param {boolean} [silent=false]
     */
    Map.prototype.removeScorePoint = function (scorePoint, silent) {
        // console.log('Map#removeScorePoint', scorePoint, silent);
        // 1. Usuwamy obiekt
        try {
            scorePoint.destroy(silent);
        } catch (e) {
            console.log('Map#removeScorePoint');
        }
        // 2. Usuwamy go z listy.
        delete this._scorePoints[scorePoint.getID()];
    };

    /**
     * @param {Function} cb
     */
    Map.prototype.loadChildren = function (cb) {
        var self = this;

        this._fb.once('value', function (snapshot) {
            var snap = snapshot.val();

            _.each(snap.players, function (remotePlayer, playerID) {
                var snapPlayer = snap.players[playerID];

                var playerInstance = new Player(snapPlayer.x, snapPlayer.y, snapPlayer.figure);
                playerInstance.setID(playerID);
                playerInstance.setName(snapPlayer.name);
                playerInstance.setScore(snapPlayer.score);

                self.addPlayer(playerInstance);
            });

            _.each(snap.scorePoints, function (remotePoint, pointID) {
                var snapPoints = snap.scorePoints[pointID];

                var scorePoint = new ScorePoint(snapPoints.x, snapPoints.y, snapPoints.value, snapPoints.figure);
                scorePoint.setID(pointID);

                self.addScorePoint(scorePoint);
            });

            if (_.isFunction(cb)) {
                cb();
            }
        });
    };

    /**
     * @param {Player} player
     */
    Map.prototype.addPlayer = function (player) {
        // console.log('Map#addPlayer', player);
        // 1. Aktualizujemy instancję.
        this._players[player.getID()] = player;
        // 2. Ustawiamy połączenie Firebase
        player.setFirebaseConnection(this._fb.child('/players/' + player.getID()));
        // 3. Aktualizujemy pozycję w Firebase
        player.sync();
    };

    /**
     * @param {Player} player
     */
    Map.prototype.removePlayer = function (player) {
        // console.log('Map#removePlayer', player);
        // 1. Usuwamy obiekt
        try {
            player.destroy();
        } catch (e) {
            console.log('Map#removePlayer');
        }
        // 2. Usuwamy go z listy.
        delete this._players[player.getID()];
        // 3. Usuwać z grupy Phasera
    };

    /**
     * @returns {string}
     */
    Map.prototype.getID = function () {
        return this._id;
    };

    Map.prototype.setID = function (id) {
        this._id = id;
    };

    /**
     * @returns {number}
     */
    Map.prototype.getStage = function () {
        return this._stage;
    };

    /**
     * @param {string} playerID
     * @returns {Player}
     */
    Map.prototype.getPlayerByID = function (playerID) {
        return this._players[playerID];
    };

    /**
     * @param {string} id
     * @returns {ScorePoint}
     */
    Map.prototype.getPointByID = function (id) {
        return _.findWhere(this._scorePoints, { _id: id });
    };

    /**
     * @param {Firebase} connection
     */
    Map.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    Map.prototype.render = function (phaser) {
        // console.log('Map#render');
        // 1. Zbudować mapę za pomocą Phaser-a.
        this._phaser = phaser.add.tilemap('map-' + this._stage);
        this._phaser.addTilesetImage('tile-ground');

        // Add +1 to tile ID generated by Tiled program.
        this._phaser.setCollision([1, 2, 4]);

        this._worldPhaser = this._phaser.createLayer('Tile Layer 1');
        this._worldPhaser.resizeWorld();

        // 2. Tworzymy grupę player-ów
        this._playersPhaser = phaser.add.group();
        this._playersPhaser.enableBody = true;
        this._playersPhaser.physicsBodyType = Phaser.Physics.ARCADE;

        // 3. Renderujemy player-ów.
        _.invoke(this._players, 'render', phaser, this._playersPhaser);

        // 4. Kamera na graczu lokalnym.
        var localPlayerInstance = this.getPlayerByID(Storage.get(Player.STORAGE_KEY));
        localPlayerInstance.setCameraOnIt(phaser);

        // 5. Tworzymy grupę points-ów
        this._scorePointsPhaser = phaser.add.group();
        this._scorePointsPhaser.enableBody = true;
        this._scorePointsPhaser.physicsBodyType = Phaser.Physics.ARCADE;

        // 6. Renderujemy punkty-ów.
        _.invoke(this._scorePoints, 'render', phaser, this._scorePointsPhaser);
    };

    /**
     * @returns {Object}
     */
    Map.prototype.getPlayers = function () {
        return this._players;
    };

    return Map;
});
