define([

], function () {
    'use strict';

    var Storage = {
        /**
         * @param {string} key
         * @param {*} val
         * @returns {string}
         */
        put: function (key, val) {
            sessionStorage.setItem(key, JSON.stringify(val));
        },

        /**
         * @param {string} key
         * @returns {*}
         */
        get: function (key) {
            return JSON.parse(sessionStorage.getItem(key));
        },

        /**
         * @param {string} key
         */
        del: function (key) {
            sessionStorage.removeItem(key);
        }
    };

    return Storage;
});
