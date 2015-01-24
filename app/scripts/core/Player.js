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

    return Player;
});
