define([
    'core/App'
], function (App) {
    'use strict';

    var Map1 = {
        _setupRaft: function (Engine) {
            Engine.raft = App.game.phaser.add.tileSprite(32 * 7, 32 * 9, 32, 32, 'tile-ground', 4);
            Engine.raft.name = 'raft';
            App.game.phaser.physics.enable(Engine.raft, Phaser.Physics.ARCADE);
            Engine.raft.body.velocity.x = 120;
        },

        _setupWater: function (Engine) {
            Engine.waterGroup = App.game.phaser.add.group();
            Engine.waterGroup.name = 'water';
            Engine.waterGroup.enableBody = true;
            Engine.waterGroup.physicsBodyType = Phaser.Physics.ARCADE;

            _.times(7, function (index) {
                var waterTile = App.game.phaser.add.tileSprite(32 * (index + 6), 32 * 9, 32, 32, 'tile-ground', 2);
                waterTile.name = 'drop';
                Engine.waterGroup.add(waterTile);
                waterTile.body.immovable = true;
                waterTile.body.setSize(32, 22, 0, 10);
            });
        },

        render: function (Engine) {
            this._setupRaft(Engine);
            this._setupWater(Engine);
        }
    };

    return Map1;
});
