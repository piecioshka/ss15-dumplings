(function (root) {
    'use strict';

    require.config({
        paths: {
            firebase: 'vendors/firebase',
            jquery: 'vendors/jquery',
            backbone: 'vendors/backbone',
            lodash: 'vendors/lodash',
            phaser: 'vendors/phaser',
            promise: 'vendors/promise'
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
        'core/Game',
        'core/Player',
        'core/PointsManager'
    ], function (Firebase, App, Game, Player, PointsManager) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.fetchMaps(function () {
            App.game.setupEvents();
            App.game.selectMap(_.random(1, 6));
            App.game.start();

            PointsManager.listen(App.game);
        });

        // Exports
        root.App = App;
    });
}(this));
