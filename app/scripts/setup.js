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
        'core/Map',
        'core/Point',
        'core/Player'
    ], function (Firebase, App, Game, Map, Point, Player) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game-pc'));
        App.game.removeMaps();

        (function () {
            var map = new Map(1);
            App.game.addMap(map);

            map.setPath('assets/maps/map-1.json');

            map.addPoint(new Point(10 * 32, 0, 1));
            map.addPoint(new Point(24 * 32, 2 * 32, 3));
            map.addPoint(new Point(8 * 32, 4 * 32, 7));

            // map.addPlayer(new Player(3, 0));
        }());

        (function () {
            var map = new Map(2);
            App.game.addMap(map);

            map.setPath('assets/maps/map-2.json');

            map.addPoint(new Point(10 * 32, 10 * 32, 11));
            map.addPoint(new Point(10 * 32, 13 * 32, 12));

            // map.addPlayer(new Player(13, 10));
            // map.addPlayer(new Player(13, 13));
        }());

        // Exports
        root.App = App;
    });
}(this));
