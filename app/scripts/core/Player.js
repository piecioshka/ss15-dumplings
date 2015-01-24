define([

], function () {
    'use strict';

    var Player = function () {
        this.phaser = undefined;
        this.firebase = {
            id: undefined,
            x: 10,
            y: 10
        };
        this.label = undefined;
    };

    Player.prototype.getName = function () {
        return this.firebase.id.slice(0, 5) + '...';
    };

    Player.prototype.toString = function () {
        return JSON.stringify(this.firebase);
    };

    return Player;
});
