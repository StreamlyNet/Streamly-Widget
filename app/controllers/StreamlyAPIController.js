'use strict'

module.exports = {
    clientScreenJS: {
        // Javascript file
        get(req, res) {
            res.sendFile(stringPath('clientScreen.js'));
        },
    },
    clientScreenCSS: {
        // CSS file
        get(req, res) {
            res.sendFile(stringPath('clientScreen.css'));
        },
    }
};
