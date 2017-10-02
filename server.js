var restify = require('restify');
var builder = require('botbuilder');

var MICROSOFT_APP_ID = '38d7eda8-a3a8-4cc4-96aa-2c6392ff0b17';
var MICROSOFT_APP_PASSWORD = 'r8ugUzyLjn5tuN3FzziGbbY';

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

server.get(/.*/, restify.plugins.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.get('/api/messages', restify.plugins.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
});