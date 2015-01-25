define([

], function () {
    'use strict';

    var PointsManager = {
        // Contains reference to player list.
        playersReference: undefined,

        // It is container for player list.
        playerListContainer: undefined,

        // Contains to score list DOM element.
        scoreList: document.querySelector('.scoreList'),

        // Contains special flag to check whether score list is visible.
        scoreListVisible: false,

        // Reference to setInterval.
        intervalTimer: undefined,

        // Contains reference to li element for individual score line.
        playerMap: {},

        buildSinglePlayer: function (player) {
            // Create container for single player line.
            var singlePlayerContainer = document.createElement('li');

            // Create text node for created line.
            var playerRow = document.createTextNode('@' + player._id.slice(0, 5) + '...: ' + player._score);

            // Append text to container.
            singlePlayerContainer.appendChild(playerRow);

            // Return created value.
            return singlePlayerContainer;
        },

        buildPlayerList: function () {
            // Get reference to players in map.
            var players = PointsManager.playersReference;

            // Create container for player list.
            PointsManager.playerListContainer = document.createElement('ul');

            // Iterate via players for build first player list.
            Object.keys(players).forEach(function (playerID) {
                var player = players[playerID];

                // Create reference for li element.
                PointsManager.playerMap[player._id] = PointsManager.buildSinglePlayer(player);

                // Append created player to player list.
                PointsManager.playerListContainer.appendChild(PointsManager.playerMap[player._id]);
            });

            // Append player list to score list.
            PointsManager.scoreList.appendChild(PointsManager.playerListContainer);
        },

        run: function () {
            var players = PointsManager.playersReference;

            // Iterate via each player and push it to score list.
            Object.keys(players).forEach(function (playerID) {
                var player = players[playerID];
                var buildedPlayer;

                // If player exists in map, replace its child with new score value.
                if (PointsManager.playerMap[player._id]) {
                    // If score is different leave this function.
                    if (PointsManager.playerMap[player._id] === player._score) {
                        return;
                    }

                    // If score is not different replace existing child.
                    buildedPlayer = PointsManager.buildSinglePlayer(player);
                    PointsManager.playerListContainer.replaceChild(buildedPlayer, PointsManager.playerMap[player._id]);
                    PointsManager.playerMap[player._id] = buildedPlayer;
                }
                // If player does not exist in map, create new child and append it to player list.
                else {
                    PointsManager.playerMap[player._id] = PointsManager.buildSinglePlayer(player);
                    PointsManager.playerListContainer.appendChild(PointsManager.playerMap[player._id]);
                }
            });
        },

        listen: function (game) {
            // Get list of map in game.
            var selectedMap = game.getSelectedMap();
            // Get player list from selected map.
            PointsManager.playersReference = selectedMap.getPlayers();

            // First build player list.
            PointsManager.buildPlayerList();

            var scoreListDOMButton = document.querySelector('.scoreListButton');

            // Create listener for handling click event on score list DOM button.
            scoreListDOMButton.addEventListener('click', function () {
                // Handling visibility of score list.
                PointsManager.scoreList.style.display = (PointsManager.scoreListVisible) ? 'none' : 'block';

                // Reverse flag for visibility score list.
                PointsManager.scoreListVisible = (PointsManager.scoreListVisible) ? false : true;
            });

            // Create and assign interval timer.
            PointsManager.intervalTimer = setInterval(PointsManager.run, 1000);
        }
    };

    return PointsManager;
});
