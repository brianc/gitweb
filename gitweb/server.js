var childProcess = require('child_process');
var exec = childProcess.execSync;
var spawn = childProcess.spawn;

var express = require('express');
var filed = require('filed');
var httpProxy = require('http-proxy');

var app = express();
var proxy = httpProxy.createProxyServer();


//build the project
console.log(exec('go build'));
var env = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
};
//start the 'gitweb' golang server
var proc = spawn(__dirname + '/gitweb', { env: env });
//redirect golang stdout & stderr to this process
proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);


//don't log requests for jspm packages
app.use(function(req, res, next) {
  if (req.path.indexOf('jspm') === -1) {
    console.log(req.method, req.path);
  }
  next();
});

//reverse proxy gitweb paths to gitweb
var paths = ['/auth', '/git', '/job'];
paths.forEach(function(path) {
  app.use(path, function(req, res) {
    proxy.web(req, res, { target: 'http://localhost:8080' + path });
  });
});

//serve the public directory
app.use(express.static(__dirname + '/public'));

//accept every route and load index.html to work with pushstate urls
app.get('*', function(req, res) {
  filed(__dirname + '/public/index.html').pipe(res);
});

//start the server
var http = require('http');

var server = http.createServer(app);

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('listening on', port)
});
