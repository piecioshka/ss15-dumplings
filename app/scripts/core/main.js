(function (root) {
    'use strict';

    require.config({
        paths: {
            firebase: '../vendor/firebase',
            jquery: '../vendor/jquery',
            lodash: '../vendor/lodash',
            phaser: '../vendor/phaser',
            promise: '../vendor/promise'
        },

        shim: {
            firebase: { exports: 'Firebase' },
            jquery: { exports: '$' },
            lodash: { exports: '_' },
            phaser: { exports: 'Phaser' },
            promise: { exports: 'promise' }
        }
    });

    require([
        'Game'
    ], function (Game) {
        root.game = new Game();
    });
}(this));
