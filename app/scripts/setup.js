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
        'core/Game',
        'core/World',
        'core/Point',
        'core/Player'
    ], function (Firebase, Game, World, Point, Player) {
        'use strict';

        var game = new Game();
        game.setFirebaseConnection(new Firebase('https://dumplings.firebaseio.com/game'));
        game.removeWorlds();

        (function () {
            var world = new World(1);
            game.addWorld(world);

            world.setMap('assets/maps/map-1.json');
            world.addPoint(new Point(0, 0, 1));
            world.addPlayer(new Player(3, 0));
        }());

        (function () {
            var world = new World(2);
            game.addWorld(world);

            world.setMap('assets/maps/map-2.json');

            world.addPoint(new Point(10, 10, 11));
            world.addPoint(new Point(10, 13, 12));

            world.addPlayer(new Player(13, 10));
            world.addPlayer(new Player(13, 13));
        }());
    });
}(this));
