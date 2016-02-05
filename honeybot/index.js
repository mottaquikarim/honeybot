var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

var HoneyBot = require('./honeybot');
app.post('/' + HoneyBot.NAME_SPACE, HoneyBot.init);

module.exports = app;

