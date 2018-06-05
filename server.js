'use strict'

require('./utils/rootRequire')();
require('./utils/stringPath')();
require('./utils/prodEnv')();
let express = require('express');
let http = require('http');
let https = require('https');
let fs = require('fs');
let Router = rootRequire('app/Router');
let config = rootRequire('config/config.js');
let app = express();
let server = http.createServer(app);

require('./config/middleware')(app, express);

Router.forEach(route => {
  app.use(route.path, route.handler);
});

server.listen(config.server.httpPort, () => {
    console.log(`Server has started on port ${config.server.httpPort}`);
});
