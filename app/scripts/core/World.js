define([
    'lodash',
    'backbone',
    'firebase',
    'core/Utilities',
    'core/Player',
    'core/Point'
], function (_, Backbone, Firebase, Utilities, Player, Point) {
    'use strict';

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
     */
    World.prototype.setMap = function (map) {
        // 1. Aktualizujemy instancję.
        this._map = map;
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
        // 1. Usuwamy obiekt
        point.destroy();
        // 2. Usuwamy go z listy.
        delete this._points[point.getID()];
    };

    World.prototype.loadChildren = function () {
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
        });
    };

    /**
     * @param {Player} player
     */
    World.prototype.addPlayer = function (player) {
        // 1. Aktualizujemy instancję.
        this._players[player.getID()] = player;
        // 2. Dodajemy do grupy Phaser
        // 3. Dodajemy do Firebase
        player.setFirebaseConnection(this._fb.child('/players/' + player.getID()));
        // 4. Aktualizujemy pozycję w Firebase
        player.sync();
    };

    World.prototype.removePlayer = function (player) {
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
     * @param {Firebase} connection
     */
    World.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    World.prototype.render = function () {
        // 1.
    };

    return World;
});
