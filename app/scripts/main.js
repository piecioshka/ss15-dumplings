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

        var world = new World();
        App.game.addWorld(world);

        world.setMap('assets/maps/map-1.json');

        world.addPoint(new Point(0, 0, 1));
        world.addPoint(new Point(0, 3, 2));
        world.addPoint(new Point(0, 6, 4));

        world.addPlayer(new Player(3, 0));
        world.addPlayer(new Player(3, 3));
        world.addPlayer(new Player(3, 6));

        App.game.renderWorld(world);

        // Exports
        root.App = App;
    });
}(this));
