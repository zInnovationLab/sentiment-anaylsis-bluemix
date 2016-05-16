var express = require('express');

var AlchemyAPI = require('alchemy-api');
var alchemyapi = new AlchemyAPI(process.env.ALCHEMY_APIKEY || '');

var app = express();
app.set('port', process.env.PORT || 8080);

// add middleware to put post text in req.text
app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

function sentiment(text, callback){
	alchemyapi.sentiment(text, {}, function (err, res) {
		if (err)
			console.log('ERROR: ', err);
		//console.log('DEBUG: response: ', res);
		callback(res.docSentiment);
	});
}

app.post('/', function(req, res) {
	//console.log('DEBUG: text: ', req.text);
	sentiment(req.text, function(sentiment_result) {
		res.send(sentiment_result);
	});
});

console.log('Listening on port ' + app.get('port') + '...');
app.listen(app.get('port'));
