define([
    'lodash',
    'core/App'
], function (_, App) {
    'use strict';

    var PointsManager = function () {
        this.resultsString = '';
        this.phaserText = undefined;

        _.bindAll(this, 'updatePointList');

        this.initialize();
    };

    PointsManager.prototype.initialize = function () {
        setInterval(this.updatePointList, PointsManager.INTERVAL_TIME);
    };

    PointsManager.prototype.updatePointList = function () {
        this.resultsString = 'Points \n';

        // Put point for local player.
        this.resultsString += (App.game.localPlayer.getName() + ': ' + App.game.localPlayer.data.points + '\n');

        // Put point for rest players.
        _.each(App.game.players, function (player) {
            this.resultsString += (player.getName() + ': ' + player.data.points + '\n');
        }, this);

        if (!this.phaserText) {
            this.phaserText = App.game.phaser.add.text(980, 0, this.resultsString, PointsManager.STYLES)
        }

        this.phaserText.setText(this.resultsString);
    };

    PointsManager.INTERVAL_TIME = 3 * 1000; // 5 sec
    PointsManager.STYLES = {font: '11px Tahoma', fill: '#000', align: 'left'};

    return PointsManager;
});
