(function () {
    'use strict';

    var gulp = require('gulp');
    var rjs = require('requirejs');

    var del = require('del');

    var when = require('when');
    var nodefn = require('when/node');

    // Config file for optimze requireJS.
    var config = require('./config.json');

    function removeFiles(fileList) {
        var promisedDelete = nodefn.call(del, fileList);

        return promisedDelete;
    }

    gulp.task('prepare', function () {
        return removeFiles([ 'dist/' ]);
    });

    gulp.task('build', ['prepare'], function () {
        //return gulp.src([ './app/scripts/**/*.js'] )
        //    .pipe(concat('main.js'))
        //    .pipe(gulp.dest('./dist'));
        var promisedOptimize = nodefn.call(rjs.optimize.bind(rjs), config);

        //return when.resolve();
        return promisedOptimize.then(function (optimizeResult) {
            //console.log('@@', optimizeResult);
        });
    });

    gulp.task('clean', ['build'], function () {
        return removeFiles([ 'built/built.txt' ]);
    });

    gulp.task('default', [ 'prepare', 'build', 'clean' ]);
}());