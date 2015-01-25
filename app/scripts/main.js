(function (root) {
    'use strict';

    require.config({
        paths: {
            firebase: 'vendor/firebase',
            jquery: 'vendor/jquery',
            backbone: 'vendor/backbone',
            lodash: 'vendor/lodash',
            phaser: 'vendor/phaser',
            promise: 'vendor/promise'
        },

        shim: {
            firebase: { exports: 'Firebase' },
            jquery: { exports: '$' },
            backbone: { exports: 'Backbone' },
            lodash: { exports: '_' },
            phaser: { exports: 'Phaser' },
            promise: { exports: 'promise' }
        }
    });

    require([
        'firebase',
        'core/App',
        'core/Game'
    ], function (Firebase, App, Game) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.fetchMaps(function () {
            App.game.setupEvents();
            App.game.selectMap(1);
            App.game.start();
        });

        // Exports
        root.App = App;
    });
}(this));
