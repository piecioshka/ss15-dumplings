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
        'core/World',
        'core/Point',
        'core/Player'
    ], function (Firebase, App, Game, World, Point, Player) {
        App.game = new Game();
        App.game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        App.game.removeWorlds();

        (function () {
            var world = new World(1);
            App.game.addWorld(world);

            world.setMap('assets/maps/map-1.json');

            world.addPoint(new Point(0, 0, 1));

            world.addPlayer(new Player(3, 0));
        }());

        (function () {
            var world = new World(2);
            App.game.addWorld(world);

            world.setMap('assets/maps/map-2.json');

            world.addPoint(new Point(10, 10, 11));
            world.addPoint(new Point(10, 13, 12));

            world.addPlayer(new Player(13, 10));
            world.addPlayer(new Player(13, 13));
        }());

        // Exports
        root.App = App;
    });
}(this));
