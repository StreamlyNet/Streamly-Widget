'use strict'

module.exports = {
    generator: {
        get(req, res) {
            res.render('generator', {prod: global.PROD_ENV});
        },
    },
};
