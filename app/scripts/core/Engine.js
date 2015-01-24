define([
    'App',
    'helpers/AssetsLoader'
], function (App, AssetsLoader) {
    'use strict';

    var Engine = {
        player: undefined,
        label: undefined,
        cursors: undefined,
        map: undefined,
        layer: undefined,

        jumpTimer: 0,
        jumpButton: undefined,

        preload: function () {
            App.game.phaser.load.image('tile-ground', AssetsLoader.IMAGES.GROUND);
            App.game.phaser.load.image('tile-monkey', AssetsLoader.IMAGES.MONKEY);
            App.game.phaser.load.tilemap('map-1', 'assets/maps/map-1.json', null, Phaser.Tilemap.TILED_JSON);
        },

        create: function () {
            App.game.phaser.physics.startSystem(Phaser.Physics.ARCADE);
            App.game.phaser.stage.backgroundColor = '#fff';

            this.map = App.game.phaser.add.tilemap('map-1');
            this.map.addTilesetImage('tile-ground');

            // Add +1 to tile ID generated by Tiled program.
            this.map.setCollision([1, 2, 4]);

            this.layer = this.map.createLayer('Tile Layer 1');
            this.layer.resizeWorld();

            App.game.phaser.physics.arcade.gravity.y = 350;

            this.player = App.game.phaser.add.sprite(0, 10, 'tile-monkey');
            App.game.phaser.physics.enable(this.player, Phaser.Physics.ARCADE);

            this.player.body.bounce.y = 0.1;
            this.player.body.collideWorldBounds = true;
            this.player.body.setSize(30, 30, 1, 1);

            this.label = App.game.phaser.add.text(0, 0, App.game.getPlayerID().substr(0, 5), {
                font: '11px Arial',
                fill: '#000',
                align: 'center'
            });

            // Stay camera on player.
            App.game.phaser.camera.follow(this.player);

            this.cursors = App.game.phaser.input.keyboard.createCursorKeys();
            this.jumpButton = App.game.phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        },

        update: function () {
            var self = this;
            // Enable collisions
            App.game.phaser.physics.arcade.collide(this.player, this.layer, function (sprite, tile) {
                if (tile.index === 4) {
                    console.log('am am am!!!');
                    self.map.removeTile(tile.x, tile.y);
                }
            }, null, this);

            // How much different between player and ground.
            this.player.body.velocity.x = 0;

            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -150;
            } else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 150;
            }

            if (this.jumpButton.isDown && this.player.body.onFloor() && App.game.phaser.time.now > this.jumpTimer) {
                this.player.body.velocity.y = -350;
                this.jumpTimer = App.game.phaser.time.now - 50;
            }

            this.label.x = this.player.x;
            this.label.y = this.player.y - 10;
        },

        render: function () {
            // Show bounding-box of player.
            // App.game.phaser.debug.body(this.player);

            // Show technical info about player.
            // App.game.phaser.debug.bodyInfo(this.player, 16, 40);
        }
    };

    return Engine;
});
