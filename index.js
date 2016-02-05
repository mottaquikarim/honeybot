// server reqs
var express = require('express');
var bodyParser = require('body-parser');

// configs
var config = require('./HoneyAPI/config');
var HoneyAPI = require('./HoneyAPI/HoneyAPI');

// app essentials
var app = express();
app.set('port', (process.env.PORT || 5000));

// input slackbot
var slackbot = require('./honeybot');
app.use( slackbot );

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


