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

    Player.prototype.updatePosition = function (position) {
        this.phaser.x = position.x;
        this.phaser.y = position.y;

        this.firebase.x = position.x;
        this.firebase.y = position.y;

        this.label.x = position.x;
        this.label.y = position.y - 10;
    };

    Player.prototype.getName = function () {
        return this.firebase.id.slice(0, 5) + '...';
    };

    Player.prototype.toString = function () {
        return JSON.stringify(this.firebase);
    };

    return Player;
});
