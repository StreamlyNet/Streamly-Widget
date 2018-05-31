'use strict';

let path = require('path');

module.exports = function() {
    global.stringPath = function(name) {
        var indexPageFiles = ['main.js', 'videoEvents.js', 'chatEvents.js'];
        var ext = name.match(/(.js)|(.css)/g)[0].split('.')[1];

        name = name.replace(/(.js)|(.css)/, '');

        if (global.PROD_ENV) {
            if (indexPageFiles.indexOf(name) !== -1) {
                return getFilePath('main', ext, true);
            }

            return getFilePath(name, ext, true);
        }

        return getFilePath(name, ext, false);
    };
};

function getFilePath(fileName, ext, prod) {
    if (prod) {
        return path.normalize(`${__dirname}/../app/public/out/${ext}/${fileName}.min.${ext}`);
    }
    if (ext === 'js') {
        return path.normalize(`${__dirname}/../app/public/js/${fileName}.${ext}`);
    }
    else {
        return path.normalize(`${__dirname}/../app/public/stylesheets/${fileName}.${ext}`);
    }
}