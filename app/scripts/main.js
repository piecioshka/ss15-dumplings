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
        'core/Game',
        'core/Player',
        'core/PointsManager',
        'core/Storage'
    ], function (Firebase, App, Game, Player, PointsManager, Storage) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.fetchMaps(function () {
            App.game.setupEvents();
            App.game.selectMap(1);
            App.game.start();

            PointsManager.listen(App.game);
        });

        if (!Storage.get(Player.STORAGE_NICK_KEY)) {
            var nickValue = window.prompt('Type your nick:');
            Storage.put(Player.STORAGE_NICK_KEY, nickValue);
        }

        // Exports
        root.App = App;
    });
}(this));
