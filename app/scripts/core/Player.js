define([

], function () {
    'use strict';

    var Player = function () {
        this.phaser = undefined;
        this.data = {
            id: undefined,
            x: 10,
            y: 10,
            points: 0
        };
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

    return Player;
});
