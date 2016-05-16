/**
######################################
# News feed updater for linuxCON demo
######################################
*/

var FeedParser = require('feedparser')
  , request = require('request');

var req = request('http://www.cbc.ca/cmlink/rss-world')
  , feedparser = new FeedParser();

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var mongoUrl;
if(process && process.env && process.env.VCAP_SERVICES) {
  console.log('VCAP SERVICES: ' + JSON.stringify(process.env.VCAP_SERVICES, null, 4));
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  for (var svcName in vcapServices) {
    if (svcName.match(/^mongo.*/)) {
      mongoUrl = vcapServices[svcName][0].credentials.uri;
      mongoUrl = mongoUrl || vcapServices[svcName][0].credentials.url;
      break;
    }
  }
} else {
  mongoUrl = 'mongodb://mongo_server:27017/news';
}
console.log('Mongo URL: ' + mongoUrl);

req.on('error', function (error) {
  // handle any request errors
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
  // always handle errors
});
MongoClient.connect(mongoUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', mongoUrl);

    // do some work here with the database.

feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

  while (item = stream.read()) {
    db.collection('news').insert(item, function(err){
	if (err) throw err;
	console.log("record added!");
    });
  }
}); 
    // work done, close the connection
  }
});
