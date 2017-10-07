import {
  createServer,
  plugins as restifyPlugins,
  Server
} from 'restify';

import {
  UniversalBot,
  ChatConnector,
  Session
} from 'botbuilder';

import waffles from './apis/waffles';
import random from './apis/random';
import announcement from './apis/announcement';

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

const bot = new UniversalBot(connector, (session: Session) => {
  waffles(session)
    .then((message: string) => {
      if (message) {
        session.send(message);
      }
    });
  random(session);
  announcement(session);
});