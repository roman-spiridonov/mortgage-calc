/* jshint ignore: start */

const http = require('http');
// var url = require('url');
// var querystring = require('querystring');
const static = require('node-static');
const config = require('./config');

const file = new static.Server(config.isDevelopment ? 'src/' : 'webapp/', {
  cache: 0
});

function accept(req, res) {
  file.serve(req, res);
}

if (!module.parent) {
  http.createServer(accept).listen(config.port);
  console.log('Server is running on port ' + config.port);
} else {
  exports.accept = accept;
}
