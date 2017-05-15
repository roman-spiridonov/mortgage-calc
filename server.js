/* jshint ignore: start */
"use strict";

const http = require('http');
const nodeStatic = require('node-static');
const nconf = require('./config').nconf;

const file = new nodeStatic.Server(nconf.get('isDevelopment') ? 'src/' : 'webapp/', {
  cache: 0
});

function accept(req, res) {
  file.serve(req, res);
}

if (!module.parent) {
  http.createServer(accept).listen(nconf.get('port'));
  console.log('Server is running on port ' + nconf.get('port'));
} else {
  exports.accept = accept;
}
