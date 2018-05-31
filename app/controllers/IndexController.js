'use strict'

var config = require('../../config/config.js').widget;

module.exports = {
  index: {
    get(req, res) {
      res.render('index', {config: config, prod: global.PROD_ENV});
    },
  },
}
