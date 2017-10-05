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
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || '38d7eda8-a3a8-4cc4-96aa-2c6392ff0b17',
    appPassword: process.env.MICROSOFT_APP_PASSWORD || 'r8ugUzyLjn5tuN3FzziGbbY'
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

  announcement(session);
});