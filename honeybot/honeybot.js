// bot for honey

var config = require('../HoneyAPI/config');
var slackConfig = require('./config');
var HoneyAPI = require('../HoneyAPI/HoneyAPI');

var HoneyBot = {};
HoneyBot.NAME_SPACE = 'honey';

HoneyBot.validateToken = function( token, res ) {
    if ( token !== slackConfig.slackToken ) {
        res.status(401);
        return false;
    }

    return true;
}

HoneyBot.validateCommand = function( command, res ) {
    if ( command.toLowerCase() !== '/'+HoneyBot.NAME_SPACE ) {
        res.status(200)
           .send('Sorry, this command, ' + command + ', is not recognized');
        return false;
    }

    return true;
}

HoneyBot.init = function( req, res, next ) {
  var isTokenValid = HoneyBot.validateToken( req.body.token, res );
  if ( !isTokenValid ) {
    return;
  }

  var isCommandValid = HoneyBot.validateCommand( req.body.command, res );
  if ( !isCommandValid ) {
    return;
  }

  var text = req.body.text;
  var tokens = text.split(' ');
  var subToken = tokens.shift();
  var userName = req.body.user_name;

  var methodToCall;
  switch( subToken ) {
    case 'search':
        methodToCall = HoneyBot.search;
        break;
    default:
        methodToCall = HoneyBot.help;
  }

  methodToCall( req, res, tokens, userName );

}

HoneyBot.search = function( req, res, args, userName) {
    var access_token = config.accessToken;
    var finalArgs = {};

    // test args for things
    var num = args.shift();
    var isNum = !isNaN( num );
    if ( isNum ) {
        finalArgs.page_size = num;
    }
    else {
        args.unshift( num );
        num = null;
    }

    var type = args.shift();
    var isPost = type.indexOf('post') !== -1;
    var isUser = type.indexOf( 'user' ) !== -1;
    var isGroup = type.indexOf( 'group' ) !== -1;
    var isType = (  isPost || isUser || isGroup );

    if ( isPost ) type = 'post';
    if ( isUser ) type = 'user';
    if ( isGroup ) type = 'group';

    if ( isType ) {
        finalArgs.type = type;
    }
    else {
        args.unshift( type );
    }

    var searchToken = args.join(' ');
    if ( searchToken ) {
        finalArgs.q = searchToken;
    }

    HoneyAPI.search( access_token, finalArgs ).then(function(body) {
        var data = JSON.parse( body );

        var postResult = data.post_result;
        var posts = [], users = [], groups = [];
        if ( postResult.posts && postResult.posts.length ) {
            posts = postResult.posts.slice(0,num || 3);
        }
        var groupResult = data.group_result;
        if ( groupResult.groups && groupResult.groups.length ) {
            groups = groupResult.groups.slice(0,num || 3);
        }
        var userResult = data.user_result;
        if ( userResult.users && userResult.users.length ) {
            users = userResult.users.slice(0,num || 3);
        }

        var labels = [], results = [];
        labels.push('Here is what I dug up for your search "' + finalArgs.q + '"');

        if ( posts.length ) {
            posts.forEach(function(post, idx) {
                results.push(HoneyBot._generateAttachment( 
                    "https://honey.is/home/#post/"+post.id,
                    post.title,
                    idx,
                    "Posts"
                ));
            });
        }

        if ( groups.length ) {
            groups.forEach(function(group, idx) {
                results.push(HoneyBot._generateAttachment( 
                    'https://honey.is/home/#group/'+group.id,
                    group.name,
                    idx,
                    "Groups"
                ));
            });
        }

        if ( users.length ) {
            users.forEach(function(user, idx) {
                results.push(HoneyBot._generateAttachment( 
                    'https://honey.is/home/#user/'+user.id,
                    user.name,
                    idx,
                    "People"
                ));
            });
        }

        var returnable = {
            ok: true,
            text: labels.join('\n'),
            attachments: results,
            response_type: 'in_channel',
        };

        res.status(200).send({'response_type': 'in_channel'});

        HoneyAPI.postResponse(req.body.response_url, returnable);
    });
};

HoneyBot._generateAttachment = function( url, label, idx, pretext ) {
    var obj = {};
    obj.plainText = label + ": " + url;

    obj.text = '<' + url + '|' + label + '>';

    if ( idx === 0 ) {
        obj.pretext = pretext;
    }

    return obj;
}

HoneyBot.help = function( req, res, args, userName) {
    res.status( 200 ).send({
        text:'HoneyBot help',
        attachments: [{
            pretext: 'Search Honey',
            text: [
                '/honey search [how_many_displayed] [what_type_to_display] the search query',
                'OPTIONAL: [how_many_displayed] => default is 3',
                'OPTIONAL: [what_type_to_display] => default is posts, groups, people',
                'REQUIRED: the search query => the thing you actually need to seach for'
            ].join('\n')
        }]
    });
};

module.exports = HoneyBot;
