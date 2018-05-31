'use strict'

let bodyParser = require('body-parser');
let path = require('path');
let compression = require('compression');

module.exports = function(app, express) {

  if (global.PROD_ENV) {
    app.use(compression());
  }

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.disable('x-powered-by');

  app.set('views', path.join(__dirname, '../app/views'));
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, '../app/public')));
};
