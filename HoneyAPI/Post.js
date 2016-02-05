var config = require('./config');
var Q = require('q');
var request = require('request');
var HoneyAPI = require('./HoneyAPI');

var Post = {};

Post.get = function( req, reply ) {
    var access_token = config.accessToken;
    var id = req.params.id;
    HoneyAPI.getPost( access_token, id )
    .then(function(body) {
        reply.send(body);
    });
}

module.exports = Post;
