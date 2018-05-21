'use strict'

require('./utils/rootRequire')();
require('./utils/prodEnv')();
let express = require('express');
let http = require('http');
let Router = rootRequire('app/Router');
let config = rootRequire('config/config.js');
let app = express();
let server = http.createServer(app);


require('./config/middleware')(app, express);

Router.forEach(route => {
  app.use(route.path, route.handler);
});


server.listen(config.server.port, (e) => {
  console.log(`Server has started on port ${config.server.port}`);
});
