var http = require('http');
// var url = require('url');
// var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.', {
    cache: 0
});

function accept(req, res) {
    file.serve(req, res);
}

if (!module.parent) {
    http.createServer(accept).listen(8080);
    console.log('Server is running on port 8080');
} else {
    exports.accept = accept;
}
