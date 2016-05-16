/*
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 *
 * (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
 *
 */

/**
 *   Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , url = require("url")
  , fs = require("fs")
  , cors = require('cors');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cors());
app.use(app.router);
app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')));
app.use("/elements", express.static(path.join(__dirname, 'elements')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var socket = io.listen(server);

socket.on('connection', function(client) {
    console.log('Connection to client established');

    // Success!  Now listen to messages to be received
    client.on('message',function(event) {
        console.log('Received message from client!',event);
    });

    client.on('disconnect',function() {
        console.log('Server has disconnected');
    });
});

require('./routes/warmup')(app,socket);
module.exports = app;
