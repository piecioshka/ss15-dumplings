define([
    'lodash',
    'backbone',
    'firebase',
    'core/Utilities',
    'core/Player',
    'core/Point'
], function (_, Backbone, Firebase, Utilities, Player, Point) {
    'use strict';

    /**
     * @param {number} stage
     * @constructor
     */
    var World = function (stage) {
        _.extend(this, Backbone.Events);
        this._id = Utilities.guid();

        this._map = '';
        this._points = {};
        // this._pointsPhaser =
        this._players = {};
        // this._playersPhaser = {};
        this._stage = stage;

        this._fb = undefined;
    };

    /**
     * @param {string} map
     * @param {boolean} [silent=false]
     */
    World.prototype.setMap = function (map, silent) {
        // 1. Aktualizujemy instancję.
        this._map = map;

        if (silent) return;

        // 2. Aktualizujemy pozycję w Firebase
        this._fb.update({
            map: map,
            stage: this._stage
        });
    };

    /**
     * @param {Point} point
     */
    World.prototype.addPoint = function (point) {
        console.log('World#addPoint', point);
        // 1. Aktualizujemy instancję.
        this._points[point.getID()] = point;
        // 2. Dodajemy do grupy Phaser
        // 3. Dodajemy do Firebase
        point.setFirebaseConnection(this._fb.child('/points/' + point.getID()));
        // 4. Aktualizujemy pozycję w Firebase
        point.sync();
    };

    /**
     * @param {Point} point
     */
    World.prototype.removePoint = function (point) {
        console.log('World#removePoint', point);
        // 1. Usuwamy obiekt
        point.destroy();
        // 2. Usuwamy go z listy.
        delete this._points[point.getID()];
    };

    /**
     * @param {Function} cb
     */
    World.prototype.loadChildren = function (cb) {
        var self = this;

        this._fb.once('value', function (snapshot) {
            var snap = snapshot.val();

            _.each(_.keys(snap.players), function (playerID) {
                var snapPlayer = snap.players[playerID];

                var player = new Player(snapPlayer.x, snapPlayer.y);
                player.setID(playerID);

                self.addPlayer(player);
            });

            _.each(_.keys(snap.points), function (pointID) {
                var snapPoint = snap.points[pointID];

                var point = new Point(snapPoint.x, snapPoint.y, snapPoint.value);
                point.setID(pointID);

                self.addPoint(point);
            });

            if (_.isFunction(cb)) {
                cb();
            }
        });
    };

    /**
     * @param {Player} player
     */
    World.prototype.addPlayer = function (player) {
        console.log('World#addPlayer', player);
        // 1. Aktualizujemy instancję.
        this._players[player.getID()] = player;
        // 2. Dodajemy do grupy Phaser
        // 3. Dodajemy do Firebase
        player.setFirebaseConnection(this._fb.child('/players/' + player.getID()));
        // 4. Aktualizujemy pozycję w Firebase
        player.sync();
    };

    /**
     * @param {Player} player
     */
    World.prototype.removePlayer = function (player) {
        console.log('World#removePlayer', player);
        // 1. Usuwamy obiekt
        player.destroy();
        // 2. Usuwamy go z listy.
        delete this._players[player.getID()];
    };

    /**
     * @returns {string}
     */
    World.prototype.getID = function () {
        return this._id;
    };

    World.prototype.setID = function (id) {
        this._id = id;
    };

    /**
     * @returns {number}
     */
    World.prototype.getStage = function () {
        return this._stage;
    };

    /**
     * @param {string} playerID
     * @returns {Player}
     */
    World.prototype.getPlayerByID = function (playerID) {
        return this._players[playerID];
    };

    /**
     * @param {Firebase} connection
     */
    World.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    World.prototype.render = function () {
        // 1. Zbudować mapę za pomocą Phaser-a.
    };

    /**
     * @returns {Object}
     */
    World.prototype.getPlayers = function () {
        return this._players;
    };

    return World;
});
