define([

], function () {
    'use strict';

    var Storage = {
        put: function (key, val) {
            return localStorage.setItem(key, JSON.stringify(val));
        },

        get: function (key) {
            return JSON.parse(localStorage.getItem(key));
        }
    };

    return Storage;
});
