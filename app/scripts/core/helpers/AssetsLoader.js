define([
    'lodash',
    'promise'
], function (_, promise) {
    'use strict';

    function loadImage(imageURL) {
        var p = new promise.Promise();

        var img = new Image();

        img.onload = function () {
            // console.log('[*] Image %s loaded.', imageURL);
            p.done();
        };

        img.src = imageURL;

        return p;
    }

    var AssetsLoader = {
        loadImages: function (images, cb) {
            var loadingHandlers = _.map(images, function (image) {
                return loadImage(image);
            });

            promise.join(loadingHandlers).then(cb);
        }
    };

    return AssetsLoader;
});
