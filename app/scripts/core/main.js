(function (root) {
    'use strict';

    require.config({
        paths: {
            firebase: '../vendor/firebase',
            jquery: '../vendor/jquery',
            lodash: '../vendor/lodash',
            phaser: '../vendor/phaser'
        },

        shim: {
            firebase: { exports: 'Firebase' },
            jquery: { exports: '$' },
            lodash: { exports: '_' },
            phaser: { exports: 'Phaser' }
        }
    });

    require([
        'game'
    ], function (Game) {
        new Game();
    });
}(this));
