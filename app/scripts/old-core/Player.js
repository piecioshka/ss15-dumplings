define([

], function () {
    'use strict';

    var Player = function () {
        this.phaser = undefined;
        this.data = Player.DEFAULT_SETTINGS;
        this.label = undefined;
    };

    Player.prototype.updatePosition = function (position) {
        this.phaser.x = position.x;
        this.phaser.y = position.y;

        this.data.x = position.x;
        this.data.y = position.y;

        this.label.x = position.x;
        this.label.y = position.y - 10;
    };

    Player.prototype.getName = function () {
        return this.data.id.slice(0, 5) + '...';
    };


    Player.DEFAULT_SETTINGS = {
        id: undefined,
        x: 0,
        y: 258,
        points: 0
    };

    return Player;
});
