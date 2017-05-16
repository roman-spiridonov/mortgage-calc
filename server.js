/* jshint ignore: start */
"use strict";

const
  http = require('http'),
  nodeStatic = require('node-static'),
  nconf = require('./config').nconf;

const
  serverRoot = nconf.get('serveFromSrc') && nconf.get('isDevelopment') ? nconf.get('src') : nconf.get('dest'),
  port = nconf.get('port'),
  file = new nodeStatic.Server(serverRoot, {
    cache: 0
  });

function accept(req, res) {
  file.serve(req, res);
}

if (!module.parent) {
  http.createServer(accept).listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Serving ${serverRoot}`)
} else {
  exports.accept = accept;
}
