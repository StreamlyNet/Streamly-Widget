'use strict';

let path = require('path');

module.exports = function() {
    global.stringPath = function(name) {
        return path.normalize(`${__dirname}/../${name}`);
    };
};
