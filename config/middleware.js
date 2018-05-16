'use strict'

let bodyParser = require('body-parser');
let path = require('path');

module.exports = function(app, express) {

  app.use(bodyParser.urlencoded({
    extended: true,
  }));


  app.disable('x-powered-by');


  app.set('views', path.join(__dirname, '../app/views'));
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, '../app/public')));
}
