define([
    'lodash',
    'jquery'
], function (_, $) {
    'use strict';

    var PointsManager = (function () {
        var TIME_TO_REFRESH_POINTS = 1000;
        var isResultsAreVisible = true;
        var labelShowList = 'Show results';
        var labelHideList = 'Hide results';
        var resultsTable = [];
        var $button, $results;

        function listen(game) {
            $button = $('#show-results-list');
            $results = $('#results-list');

            $button.click(function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                if (isResultsAreVisible) {
                    $button.text(labelShowList);
                    hideList();
                } else {
                    $button.text(labelHideList);
                    showList();
                }

                isResultsAreVisible = !isResultsAreVisible;
            });

            showList();

            collectPoints(game);
        }

        function collectPoints(game) {
            // console.log('PointsManager#collectPoints', game);
            var players = game.getSelectedMap().getPlayers();

            setInterval(function () {
                if (!isResultsAreVisible) {
                    return;
                }

                resultsTable = _.map(players, function (player) {
                    return {
                        name: player.getName(),
                        score: player.getScore()
                    };
                });

                sort();
                render();
            }, TIME_TO_REFRESH_POINTS);
        }

        function sort() {
            resultsTable.sort(function (a, b) {
                if (a.score > b.score) {
                    return -1;
                } if (a.score < b.score) {
                    return 1;
                }
                return 0;
            })
        }

        function render() {
            var $list = $('<ul>');

            _.each(resultsTable, function (row, index) {
                var $row = $('<li>').html('<strong>' + row.score + '</strong>: ' + row.name);
                if (index === 0) {
                    $row.addClass('winner');
                }
                $list.append($row);
            });

            $results.html($list);
        }

        function showList() {
            $results.css('opacity', 1);
        }

        function hideList() {
            $results.css('opacity', 0);
        }

        return {
            listen: listen
        }
    }());

    return PointsManager;
});
