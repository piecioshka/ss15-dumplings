define([

], function () {
    'use strict';

    var Storage = {
        put: function (key, val) {
            return sessionStorage.setItem(key, JSON.stringify(val));
        },

        get: function (key) {
            return JSON.parse(sessionStorage.getItem(key));
        }
    };

    return Storage;
});
