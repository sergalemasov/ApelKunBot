var restify = require('restify');
var builder = require('botbuilder');
var names = require('./apis/names');
var random = require('./apis/random');
var waffles = require('./apis/waffles');
var announcement = require('./apis/announcement');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
// ID and PASSWORD have been moved to heroku config variables
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

server.get(/.*/, restify.plugins.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

var bot = new builder.UniversalBot(connector, function (session) {
  waffles(session)
    .then(function (message) {
      if (message) {
        session.send(message);
      }
    });
  random(session);
  announcement(session);
});