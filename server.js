var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var _ = require('underscore');
var async = require('async');

var app = express();
var ig = requite('config.js');

app.use(express.static("."));
app.use(bodyParser());
app.use(morgan());

app.get("/", function(req, res) {
  res.status(200).sendfile("peaks/index.html");
});

app.get("/imageData", function(req, res) {
  var userID = req.body.userID;
  var images = getImages('571377691', {
    complete: function(images) {
      var data = _(images)
        .filter(function (x) { return x !== undefined; })
        .map(function (img) { return img.location; })
        .filter(function(x) {
          return x !== null;
        })
        .map(function(location) {
          return {
            latitude: Math.round(location.latitude),
            longitude: Math.round(location.longitude)
          };
        })
        .reduce(function(memo, location) {
          if (!(JSON.stringify(location) in memo)) {
            memo[JSON.stringify(location)] = 0;
          }
          memo[JSON.stringify(location)] += 1;
          return memo;
        }, {});

      var results = [];
      _.each(data, function(magnitude, location) {
        location = JSON.parse(location);
        results.push(location.latitude);
        results.push(location.longitude);
        results.push(magnitude * 0.005);
      });

      res.status(200).send(
        JSON.stringify([
          ['popular', results]
        ])
      );
    },
    error: function(err) {
      console.error(err.stack);
    }
  });
});

var redirect_uri = 'http://localhost';


var authorizeUser = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, {
    scope: ['likes'],
    state: 'a state'
  }));
};

var handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
};

// This is where you would initially send users to authorize
app.get('/authorizeUser', authorizeUser);
// This is your redirect URI
app.get('/handleauth', handleauth);

var getImages = function (user, opts) {
  var followers = [];
  var recUsers = function (err, users, pagination, limit) {
    followers = followers.concat(users);
    if (pagination.next) {
      pagination.next(recUsers);
    } else {
      grabAll(users);
    }
  };

  var grabAll = function (users) {
    async.map(users, function (user, cb) {
      var results = [];
      var recFeed = function (err, medias, pagination, limit) {
        results = results.concat(medias);
        if (limit && pagination.next) {
          pagination.next(recFeed);
        } else {
          cb(null, results);
        }
      };
      ig.user_media_recent(user.id, recFeed);
    }, function (err, results) {
      if (err) {
        console.error("ERROR:", err);
      } else {
        opts.complete(
          _.flatten(results)
        );
      }
    });
  };

  ig.user_followers(user, recUsers);
};

app.listen(3000);
console.log("On 3k");
