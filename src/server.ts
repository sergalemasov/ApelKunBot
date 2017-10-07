import {
  createServer,
  plugins as restifyPlugins,
  Server
} from 'restify';

import {
  UniversalBot,
  ChatConnector
} from 'botbuilder';
// var names = require('./apis/names.ts');
// var random = require('./apis/random.ts');
import waffles from './apis/waffles';
import random from './apis/random';
import announcement from './apis/announcement';
// var announcement = require('./apis/announcement.ts');

// Setup Restify Server
const server: Server = createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
// ID and PASSWORD have been moved to heroku config variables
const connector: ChatConnector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

server.get(/.*/, restifyPlugins.serveStatic({
	'directory': '.',
	'default': '../index.html'
}));

var bot = new UniversalBot(connector, function (session) {
  waffles(session)
    .then(function (message: string) {
      if (message) {
        session.send(message);
      }
    });
  random(session);
  announcement(session);
});