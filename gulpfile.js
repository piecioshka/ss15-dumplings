'use strict';

var gulp = require('gulp');
var util = require('gulp-util');
var rjs = require('requirejs');
var del = require('del');
var Q = require('q');

// Legend for tasks.
require('gulp-help')(gulp);

// Config file for optimize requireJS.
var config = require('./config.json');

gulp.task('prep-dist', 'Remove dir dist/', function () {
    return del([
        'dist/'
    ]);
});

gulp.task('optimize', 'Optymalization r.js.', ['prep-dist'], function () {
    var deferred = Q.defer();
    rjs.optimize(config, function () {
        deferred.resolve();
    });
    return deferred.promise;
});

gulp.task('clean-dist', 'Remove logs.', ['optimize'], function (cb) {
    del([
        './dist/build.txt'
    ], cb);
});

gulp.task('build', 'Building application', ['optimize', 'clean-dist'], function () {
    util.log(util.colors.yellow('Finished building.'));
});
