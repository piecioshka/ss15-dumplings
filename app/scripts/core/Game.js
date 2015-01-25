define([
    'lodash',
    'backbone',
    'promise',
    'phaser',
    'core/Configuration',
    'core/Map',
    'core/Player',
    'core/Storage'
], function (_, Backbone, promise, Phaser, Configuration, Map, Player, Storage) {
    'use strict';

    var Game = function () {
        _.extend(this, Backbone.Events);
        this._maps = {};
        this._selectedMapID = undefined;
        this._fb = undefined;
        this._phaser = new Phaser.Game(Configuration.WORLD_WIDTH, Configuration.WORLD_HEIGHT, Phaser.CANVAS, 'playground');
        this._phaser.state.add('Bootstrap', {
            preload: this.preload.bind(this),
            create: this.create.bind(this),
            update: this.update.bind(this)
        });

        this._phaserCursors = undefined;
        this._phaserJumpButton = undefined;

        console.info('Game was created at: %s', new Date());
    };

    /**
     * @param {Map} map
     */
    Game.prototype.addMap = function (map) {
        // console.log('Game#addMap', map);
        // 1. Aktualizujemy instancję.
        this._maps[map.getID()] = map;
        // 2. Ustawiamy połączenie Firebase
        map.setFirebaseConnection(this._fb.child(map.getID()));
    };

    Game.prototype.setupEvents = function () {
        var self = this;

        // Jeśli usunęliśmy dowolną mapę z gry, to restartujemy całą gre.
        this._fb.on('child_removed', function () {
            location.reload(true);
        });

        _.each(this._maps, function (map, mapID) {
            this._fb.child(mapID + '/points').on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                var pointInstance = map.getPointByID(snap.id);
                map.removeScorePoint(pointInstance, true);
            });

            // ---------------------------------------------------------------------------------------------------------

            this._fb.child(mapID + '/players').on('child_added', function (snapshot) {
                var snap = snapshot.val();
                var playerInstance = map.getPlayerByID(snap.id);

                if (!playerInstance) {
                    playerInstance = new Player(snap.x, snap.y);
                    playerInstance.setID(snap.id);
                    playerInstance.setName(snap.name);
                    playerInstance.setScore(snap.score);
                    playerInstance.setFigure(snap.figure);
                    playerInstance.render(self._phaser, map._playersPhaser);
                    map.addPlayer(playerInstance);
                }
            });

            this._fb.child(mapID + '/players').on('child_removed', function (snapshot) {
                var snap = snapshot.val();
                var playerInstance = map.getPlayerByID(snap.id);
                map.removePlayer(playerInstance);
            });

            this._fb.child(mapID + '/players').on('child_changed', function (snapshot) {
                var snap = snapshot.val();
                var playerInstance = map.getPlayerByID(snap.id);
                var localPlayerInstance = map.getPlayerByID(Storage.get(Player.STORAGE_KEY));

                if (playerInstance === localPlayerInstance) {
                    return;
                }

                if (playerInstance) {
                    playerInstance.setPosition(snap.x, snap.y, true);
                    playerInstance.setScore(snap.score);
                }
            });
        }, this);
    };

    /**
     * @param {Function} cb
     */
    Game.prototype.fetchMaps = function (cb) {
        var self = this;

        this._fb.once('value', function (snapshot) {
            var snap = snapshot.val();

            var callbacks = [];

            _.each(snap, function (remoteMap, mapID) {
                var p = new promise.Promise();
                var snapMap = snap[mapID];

                var map = new Map(snapMap.stage);
                map.setID(mapID);
                map.setPath(snapMap.path, true);

                self.addMap(map);

                map.loadChildren(function () {
                    p.done();
                });

                callbacks.push(p);
            });

            promise.join(callbacks).then(cb);
        });
    };

    /**
     * @param {number} stage
     */
    Game.prototype.selectMap = function (stage) {
        var cachedSelectedMapID = this._selectedMapID;

        delete this._selectedMapID;

        _.each(this._maps, function (mapInstance, mapID) {
            var map = this._maps[mapID];

            if (map.getStage() !== stage) {
                return;
            }

            this._selectedMapID = mapID;
        }, this);

        if (!this._selectedMapID) {
            throw new Error('Sorry, we could not load map with stage: ' + stage);
        }

        if (cachedSelectedMapID && cachedSelectedMapID !== this._selectedMapID) {
            var map = this._maps[this._selectedMapID];

            if (map) {
                var localPlayerInstance = map.getPlayerByID(Storage.get(Player.STORAGE_KEY));

                if (localPlayerInstance) {
                    map.removePlayer(localPlayerInstance);
                }
            }
        }
    };

    Game.prototype.removeMaps = function () {
        this._fb.remove(function (error) {
            if (error) {
                throw new Error('Synchronization failed');
            }
        });
    };

    Game.prototype.renderSelectedMap = function () {
        var localPlayer, localPlayerInstance;
        var map = this._maps[this._selectedMapID];
        var playerID = Storage.get(Player.STORAGE_KEY);

        if (_.isEmpty(playerID)) {
            localPlayer = new Player(_.random(30, 90), 194);
            Storage.put(Player.STORAGE_KEY, localPlayer.getID());
        } else {
            localPlayerInstance = map.getPlayerByID(playerID);
            if (localPlayerInstance) {
                localPlayer = localPlayerInstance;
            }
        }

        // Może się jeszcze nie stworzył?
        if (localPlayer) {
            map.addPlayer(localPlayer);
        }

        map.render(this._phaser);
    };

    /**
     * @param {Firebase} connection
     */
    Game.prototype.setFirebaseConnection = function (connection) {
        this._fb = connection;
    };

    Game.prototype.preload = function () {
        // console.log('Game#preload');
        this._phaser.load.spritesheet('tile-ground', 'assets/images/tile-ground.png', 32, 32);
        this._phaser.load.image('background', 'assets/images/github.jpeg');

        this._phaser.load.image('tool-grunt', 'assets/tools/grunt.png');
        this._phaser.load.image('tool-yeoman', 'assets/tools/yeoman.png');
        this._phaser.load.image('tool-bower', 'assets/tools/bower.png');
        this._phaser.load.image('tool-angular', 'assets/tools/angular.png');
        this._phaser.load.image('tool-bootstrap', 'assets/tools/bootstrap.png');
        this._phaser.load.image('tool-css3', 'assets/tools/css3.png');
        this._phaser.load.image('tool-gulp', 'assets/tools/gulp.png');
        this._phaser.load.image('tool-html5', 'assets/tools/html5.png');
        this._phaser.load.image('tool-sass', 'assets/tools/sass.png');

        this._phaser.load.tilemap('map-1', 'assets/maps/map-1.json', null, Phaser.Tilemap.TILED_JSON);
        this._phaser.load.tilemap('map-2', 'assets/maps/map-2.json', null, Phaser.Tilemap.TILED_JSON);
    };

    Game.prototype.create = function () {
        // console.log('Game#create');
        this._phaser.physics.startSystem(Phaser.Physics.ARCADE);
        this._phaser.stage.backgroundColor = '#fff';

        var bg = this._phaser.add.tileSprite(0, 0, Configuration.MAX_WORLD_WIDTH, Configuration.MAX_WORLD_HEIGHT, 'background');
        bg.fixedToCamera = true;

        this._phaserCursors = this._phaser.input.keyboard.createCursorKeys();
        this._phaserJumpButton = this._phaser.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.renderSelectedMap();
    };

    Game.prototype.update = function () {
        // console.log('Game#update');

        if (!this.__cachedLocalPlayerInstance || !this.__cachedMap) {
            this.__cachedMap = this._maps[this._selectedMapID];
            this.__cachedLocalPlayerInstance = this.__cachedMap.getPlayerByID(Storage.get(Player.STORAGE_KEY));
        }

        // Może ktoś wyczyścił storage?
        if (this.__cachedLocalPlayerInstance) {
            this.setupCollisions(this.__cachedLocalPlayerInstance, this.__cachedMap);
            this.__cachedLocalPlayerInstance.update(this._phaser, this._phaserCursors, this._phaserJumpButton);
        }
    };

    Game.prototype.setupCollisions = function (localPlayerInstance, map) {
        // console.log('Game#setupCollisions');

        if (!this.__cachedArcade) {
            this.__cachedArcade = this._phaser.physics.arcade;
        }

        this.__cachedArcade.collide(map._playersPhaser, map._worldPhaser);
        this.__cachedArcade.overlap(map._playersPhaser, map._scorePointsPhaser, function (player, scorePoint) {
            var pointInstance = map.getPointByID(scorePoint.id);
            map.removeScorePoint(pointInstance);

            if (player.id === localPlayerInstance.getID()) {
                localPlayerInstance.addCollectedPoints(pointInstance);
            }
        });

        // Żeby punkty trzymały sie ziemi.
        this.__cachedArcade.collide(map._scorePointsPhaser, map._worldPhaser);
    };

    Game.prototype.start = function () {
        this._phaser.state.start('Bootstrap');
    };

    Game.prototype.getSelectedMap = function () {
        return this._maps[this._selectedMapID];
    };

    return Game;
});
