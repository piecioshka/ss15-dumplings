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
        'core/Point'
    ], function (Firebase, App, Game, Map, Point) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.removeMaps();

        (function () {
            var map = new Map(1);
            App.game.addMap(map);

            map.setPath('assets/maps/map-1.json');

            map.addScorePoint(new Point(10 * 32,  2 * 32, 7, Point.ANGULAR));
            map.addScorePoint(new Point( 8 * 32,  6 * 32, 7, Point.BOOTSTRAP));
            map.addScorePoint(new Point( 7 * 32,  8 * 32, 1, Point.CSS3));
            map.addScorePoint(new Point( 9 * 32, 18 * 32, 1, Point.GULP));
            map.addScorePoint(new Point(16 * 32, 19 * 32, 3, Point.HTML5));
            map.addScorePoint(new Point( 3 * 32, 21 * 32, 3, Point.SASS));
            map.addScorePoint(new Point(17 * 32,  4 * 32, 7, Point.ANGULAR));
            map.addScorePoint(new Point(18 * 32, 11 * 32, 7, Point.BOOTSTRAP));
            map.addScorePoint(new Point(23 * 32,  7 * 32, 1, Point.CSS3));
            map.addScorePoint(new Point(21 * 32, 18 * 32, 1, Point.GULP));
            map.addScorePoint(new Point(27 * 32, 20 * 32, 3, Point.HTML5));
            map.addScorePoint(new Point(32 * 32, 21 * 32, 3, Point.SASS));
            map.addScorePoint(new Point(36 * 32, 19 * 32, 3, Point.SASS));
            map.addScorePoint(new Point(30 * 32, 15 * 32, 7, Point.ANGULAR));
            map.addScorePoint(new Point(39 * 32, 20 * 32, 7, Point.BOOTSTRAP));
            map.addScorePoint(new Point(43 * 32, 15 * 32, 1, Point.CSS3));
            map.addScorePoint(new Point(49 * 32, 22 * 32, 1, Point.CSS3));
        }());

        (function () {
            var map = new Map(2);
            App.game.addMap(map);

            map.setPath('assets/maps/map-2.json');

            map.addScorePoint(new Point(10 * 32, 10 * 32, 11));
            map.addScorePoint(new Point(10 * 32, 13 * 32, 12));
        }());

        // Exports
        root.App = App;
    });
}(this));
