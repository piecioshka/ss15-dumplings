define([

], function () {
    'use strict';

    var Configuration = {
        MAX_WORLD_WIDTH: 1600,  // 32 * 50
        MAX_WORLD_HEIGHT: 800,  // 32 * 25,

        WINDOW_WIDTH: window.innerWidth,
        WINDOW_HEIGHT: window.innerHeight
    };

    Configuration.WORLD_WIDTH = (Configuration.WINDOW_WIDTH < Configuration.MAX_WORLD_WIDTH) ? Configuration.WINDOW_WIDTH : Configuration.MAX_WORLD_WIDTH;
    Configuration.WORLD_HEIGHT = (Configuration.WINDOW_HEIGHT < Configuration.MAX_WORLD_HEIGHT) ? Configuration.WINDOW_HEIGHT : Configuration.MAX_WORLD_HEIGHT;

    return Configuration;
});
