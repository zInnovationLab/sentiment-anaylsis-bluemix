/*
 * Licensed Materials - Property of IBM
 * "Restricted Materials of IBM"
 *
 * (c) Copyright IBM Corp. 2000, 2016 All Rights Reserved
 *
 */

var request = require('request');
var mongodb = require('mongodb');

var socketio = require("socket.io"),
    http = require("http"),
    url = require("url"),
    fs = require("fs"),
    io = require('socket.io'),
    merge = require('merge'),
    exec = require('child_process').exec;

var MongoClient = mongodb.MongoClient;
var useAlchemy = (process && process.env && process.env.USE_ALCHEMY === "yes") ? true : false;
/**var alchemyURL = (useAlchemy && process.env.ALCHEMY_URL) ? process.env.ALCHEMY_URL : "http://linuxconalchemy.mybluemix.net";
*/
var alchemyPath = "http://" + process.env.ALCHEMY_API_PORT_8080_TCP_ADDR + ":" + process.env.ALCHEMY_API_PORT_8080_TCP_PORT;
var alchemyURL = (useAlchemy && process.env.ALCHEMY_API_PORT_8080_TCP) ? alchemyPath : "http://linuxconalchemy.mybluemix.net";
console.log('useAlchemy: ', useAlchemy, ' at: ', alchemyURL);

if(process && process.env && process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  console.log('VCAP SERVICES: ', vcapServices);
  for (var svcName in vcapServices) {
    if (svcName.match(/^mongo.*/)) {
      mongoUrl = vcapServices[svcName][0].credentials.uri;
      mongoUrl = mongoUrl || vcapServices[svcName][0].credentials.url;
      break;
    }
  }
} else {
  var mongoUrl = 'mongodb://mongo_server:27017/news';
}
console.log('Mongo URL: ' + mongoUrl);

var sockets = {};

module.exports = function (app, socket) {
    /**
     * Get Topology landing page
     */
    app.get('/news-sentiment', function (req, res) {
        res.render('news-sentiment', {});
    });

    socket.on("connection", function (socket) {
        console.log(socket.id + " connected");
        sockets[socket] = {};
        var newsInterval = 700;
        var tweetInterval = newsInterval;
        var tradeInterval = newsInterval;

        socket.on("search", function (data) {
            var term = data.toLowerCase();
            console.log("search term: " + term);
            MongoClient.connect(mongoUrl, function(err, db) {
                if(err)
                    console.log("Unable to connect : ", err); 
                else {
                    console.log("This is connected");
                    if (useAlchemy)
                        alchemySearch(socket, db, term);
                    else
                        sparkSearch(socket, db, term);
                } 
            });  // mongo connection
        });  // socket search

    });  // socket connection

};  // module export

function alchemySearch(socket, db, term) {
    var collect =  db.collection("news");
    collect.find({ 'description': { '$regex': term, '$options': 'i' }}).toArray(function(err,result){
        if (err) {
            console.log ("ERROR: news.find: ", err);
        } else {
            for (var i=0; i < result.length; i++) {

                (function(news) {
                    request({
                        url: alchemyURL,
                        method: 'POST',
                        headers: {'Content-Type': 'text/plain'},
                        body: news.text
                    }, function(error, response, body){
                        if(error) {
                            console.log(error);
                        } else {
                            news.sentiment = JSON.parse(body);
                            news.sentiment = tweet.sentiment['type'].toUpperCase();
                            //console.log(tweet);
                            socket.emit("news", news);
                        }
                    });
                })(result[i]);   // request sentiment closure

            }
        }
    });  // find
}

function sparkSearch(socket, db, term) {
    var collect =  db.collection("tweets");
    //collect.find({"text":new RegExp("^"+term+",|, "+term+"(?!\w)")}).toArray(function(err,result){
    collect.find({"text":new RegExp('(\\b'+term+'\\b)', "gmi")}).toArray(function(err,result){ 
               if (err) console.log ("error: "+err);
                else{       
                    console.log(result.length);
                    var cmd = 'curl -d \'input.string=';
                    var formatted_tweets = '"{\\"tweets\\" :[';                      
        var tweets = '';
                    for(var i = 0; i < result.length; i++){
                        tweets += JSON.stringify(result[i]);
                    }
        tweets =  tweets.replace(/"/g, '\\"')
        .replace(/'/g, '')
        .replace(/}{/g, '},{')
        .replace(/\\n/g, ' ')
        .replace(/\t/g, '')
//          .replace(/\//g, '\/')
        .replace(/\b/g, '')
        .replace(/\f/g, '')
        .replace(/\r/g, '');
        formatted_tweets = formatted_tweets+''+ tweets+ ']}"'           

        fs.writeFile("./test.json", formatted_tweets, function(err){
                        if(err){
                            return console.log(err);
                        }
                        console.log("The file has been saved");
                    });
             cmd += ''+formatted_tweets+'\'  \'alchemy_api:8080/jobs?appName=test&classPath=linuxcon.SentimentJob&context=test-context&sync=true&timeout=200\''
//          cmd = "echo Hello"
                   fs.writeFile("./cmd", cmd, function(err){
                   });
            
                    exec(cmd, function (error, stdout, stderr){
            var obj = (JSON.parse(stdout)).result;
            obj = //obj.replace(/},{/g, '}{')
            obj.replace(/\\"/g, '')
            .replace(/!/, '\\!');
            obj = JSON.parse(obj)
            console.log(obj.length);
                for (var i = 0; i < obj.length ; i++){
            socket.emit("tweets", obj[i]);
            console.log(obj[i]);
            }
                    });
                }   
            });
}
