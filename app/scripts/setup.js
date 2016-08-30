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
        'core/Map',
        'core/ScorePoint'
    ], function (Firebase, App, Game, Map, ScorePoint) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.removeMaps();
        
        function addPoints(map) {
            map.addScorePoint(new ScorePoint( 9 * 32, 18 * 32, 11, ScorePoint.GULP));
            map.addScorePoint(new ScorePoint(21 * 32, 18 * 32, 11, ScorePoint.GULP));

            map.addScorePoint(new ScorePoint(10 * 32, 10 * 32, 22, ScorePoint.ANGULAR));
            map.addScorePoint(new ScorePoint(10 * 32, 13 * 32, 22, ScorePoint.ANGULAR));
            map.addScorePoint(new ScorePoint(10 * 32,  2 * 32, 22, ScorePoint.ANGULAR));
            map.addScorePoint(new ScorePoint(17 * 32,  4 * 32, 22, ScorePoint.ANGULAR));
            map.addScorePoint(new ScorePoint(30 * 32, 15 * 32, 22, ScorePoint.ANGULAR));

            map.addScorePoint(new ScorePoint( 8 * 32,  6 * 32, 33, ScorePoint.BOOTSTRAP));
            map.addScorePoint(new ScorePoint(39 * 32, 20 * 32, 33, ScorePoint.BOOTSTRAP));
            map.addScorePoint(new ScorePoint(18 * 32, 11 * 32, 33, ScorePoint.BOOTSTRAP));

            map.addScorePoint(new ScorePoint( 3 * 32, 21 * 32, 44, ScorePoint.SASS));
            map.addScorePoint(new ScorePoint(32 * 32, 21 * 32, 44, ScorePoint.SASS));
            map.addScorePoint(new ScorePoint(36 * 32, 19 * 32, 44, ScorePoint.SASS));

            map.addScorePoint(new ScorePoint(27 * 32, 20 * 32, 55, ScorePoint.HTML5));
            map.addScorePoint(new ScorePoint(16 * 32, 19 * 32, 55, ScorePoint.HTML5));

            map.addScorePoint(new ScorePoint(23 * 32,  7 * 32, 66, ScorePoint.CSS3));
            map.addScorePoint(new ScorePoint( 7 * 32,  8 * 32, 66, ScorePoint.CSS3));
            map.addScorePoint(new ScorePoint(43 * 32, 15 * 32, 66, ScorePoint.CSS3));
            map.addScorePoint(new ScorePoint(49 * 32, 22 * 32, 66, ScorePoint.CSS3));
        }

        (function () {
            var map = new Map(1);
            App.game.addMap(map);
            map.setPath('assets/maps/map-1.json');
            addPoints(map);
        }());

        (function () {
            var map = new Map(2);
            App.game.addMap(map);
            map.setPath('assets/maps/map-2.json');
            addPoints(map);
        }());

        (function () {
            var map = new Map(3);
            App.game.addMap(map);
            map.setPath('assets/maps/map-3.json');
            addPoints(map);
        }());

        (function () {
            var map = new Map(4);
            App.game.addMap(map);
            map.setPath('assets/maps/map-4.json');
            addPoints(map);
        }());

        (function () {
            var map = new Map(5);
            App.game.addMap(map);
            map.setPath('assets/maps/map-5.json');
            addPoints(map);
        }());

        (function () {
            var map = new Map(6);
            App.game.addMap(map);
            map.setPath('assets/maps/map-6.json');
            addPoints(map);
        }());

        // Exports
        root.App = App;
    });
}(this));
