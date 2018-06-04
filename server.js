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
let server;

if (global.PROD_ENV) {
    let httpOptions = {
        key: fs.readFileSync('./security/cert.key'),
        cert: fs.readFileSync('./security/cert.pem')
    };

    server = https.createServer(httpOptions, app);
}
else {
    server = http.createServer(app);
}

require('./config/middleware')(app, express);

Router.forEach(route => {
  app.use(route.path, route.handler);
});

if (global.PROD_ENV) {
    server.listen(config.server.httpsPort, () => {
        console.log(`Server has started on port ${config.server.httpsPort}`);
    });

    app.listen(config.server.httpPort, () => {
        console.log('server running at ' + config.server.httpPort);
    });
}
else {
    server.listen(config.server.httpPort, () => {
        console.log(`Server has started on port ${config.server.httpPort}`);
    });
}