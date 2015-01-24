(function () {
    'use strict';

    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
    })();

    if (localStorage.getItem('playerId') == null) {
        localStorage.setItem('playerId', guid())
    }

    var currentPlayerId = localStorage.getItem('playerId');


    var players = new Firebase('https://dumplings.firebaseio.com/players');

    var localPlayer = {
        id: currentPlayerId,
        x: 10,
        y: 10
    };

    function updatePlayer() {
        players.child(currentPlayerId).update(localPlayer);
    }

    players.child(currentPlayerId).once('value', function (snapshot) {
        if (snapshot.val() !== null) {
            // chuj
            localPlayer = snapshot.val();
        } else {
            players.child(currentPlayerId).set(localPlayer);
        }
    });

    $('body').keydown(function (key) {

        if (key.keyCode == 38) { // top
            localPlayer.y = localPlayer.y - 10;
        } else if (key.keyCode == 37) { // left
            localPlayer.x = localPlayer.x - 10;
        } else if (key.keyCode == 39) { // right
            localPlayer.x = localPlayer.x + 10;
        } else if (key.keyCode == 40) { // down
            localPlayer.y = localPlayer.y + 10;
        }

        if (_.contains([37, 38, 39, 40], key.keyCode)) {
            updatePlayer();
        }

    });

    players.on('child_added', function (snapshot) {
        var snap = snapshot.val();
        $("playground").append($("<player id='" + snap.id + "' style='top:" + snap.y + "px; left:" + snap.x + "px;'>"));
    });

    players.on('child_changed', function (snapshot) {
        var snap = snapshot.val();
        $("#" + snap.id).animate({top: snap.y, left: snap.x}, 0);
    });

    players.on('child_removed', function () {
        var snap = snapshot.val();
        $("#" + snap.id).delete();
    });

}());
