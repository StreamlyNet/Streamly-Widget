'use strict'

require('./utils/rootRequire')();
require('./utils/prodEnv')();
let express = require('express');
let http = require('http');
let Router = rootRequire('app/Router');
let conf = rootRequire('config/serverConf.json');
let app = express();
let server = http.createServer(app);


require('./config/middleware')(app, express);

Router.forEach(route => {
  app.use(route.path, route.handler);
});


server.listen(conf.port,(e) => {
  console.log(`Server has started on port ${conf.port}`);
});
