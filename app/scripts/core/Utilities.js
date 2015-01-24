define([

], function () {
    'use strict';

    var Utilities = {
        s4: function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        },

        guid: function () {
            var s4 = this.s4;
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
    };

    return Utilities;
});
