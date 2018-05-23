'use strict'

module.exports = {
    clientScreenJS: {
        // Javascript file
        get(req, res) {
            res.sendFile(stringPath('app/public/js/clientScreen.js'));
        },
    },
    clientScreenCSS: {
        // CSS file
        get(req, res) {
            res.sendFile(stringPath('app/public/stylesheets/clientScreen.css'));
        },
    }
};
