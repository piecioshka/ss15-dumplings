define([
    'lodash',
    'promise'
], function (_, promise) {
    'use strict';

    var Scheduler = function () {
        this._queue = [];
    };

    Scheduler.prototype.addTask = function (task) {
        this._queue.push(task);
    };

    Scheduler.prototype.resolveAllTasks = function (cb) {
        if (this._queue.length) {
            promise.chain(this._queue).then(cb);
        } else if (_.isFunction(cb)) {
            cb();
        }
    };

    Scheduler.prototype.getLength = function () {
        return _.size(this._queue);
    };

    return Scheduler;
});
