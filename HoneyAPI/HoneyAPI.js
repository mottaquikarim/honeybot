var config = require('./config');
var request = require('request');
var Q = require('q');
var BASE = config.urlBase;

var DeferredFactory = function( func, scope ) {
    return function() {
        var d = Q.defer();
        var args = [].slice.call( arguments );
        var callback = args.push(function( err, httpResp, body ) {
            if ( err ) {
                throw new Error( err );
            }
            d.resolve( body );
        });

        func.apply( scope, args );

        return d.promise;
    };
}; 

var HoneyAPI = {};

HoneyAPI.search = DeferredFactory(
    function( access_token, args, cb ) {
        var argsAsString = Object.keys( args ).reduce(function(argBits, arg) {
            var val = args[ arg ];

            argBits.push( arg+'='+val );
            console.log( arg, val );
            return argBits;
        }, []).join('&');

        console.log( argsAsString );

        var method = "GET",
            form = {},
            url = BASE + 'search?'+argsAsString;

        request({
            url: url,
            method: method,
            headers: {
                "Authorization": "Bearer " + access_token
            },
            form: form
        }, cb);
    },
    null
);

HoneyAPI.postResponse = DeferredFactory(
    function( url, data, cb ) {
        var method = "POST",
            form = data;

        request({
            url: url,
            method: method,
            body: form,
            json: true
        }, cb);
    },
    null
);

HoneyAPI.getPost = DeferredFactory(
    function( access_token, id, cb ) {
        console.log( BASE + 'post/'+id );
        var method = "GET",
            form = {},
            url = BASE + 'post/'+id;

        request({
            url: url,
            method: method,
            headers: {
                "Authorization": "Bearer " + access_token
            },
            form: form
        }, cb);
    },
    null
);


module.exports = HoneyAPI;
