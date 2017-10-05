const request = require('request');

const dataUrl = 'https://ng2-app.firebaseio.com/authorization.json';
const MESSAGES = {
  ERROR: 'Ошибка :(',
  UNAUTH: 'Ты кто такой?'
}

function handleError(session, error) {
  session.send(error);
}

function authorization(session) {
  return new Promise((resolve, reject) => {
    if (!session) {
      resolve();
      return;
    }

    if (session.message && session.message && session.message.user && session.message.user.id) {
      const fromId = session.message.user.id;

      request({
        url: dataUrl
      }, function (error, response, body) {
        if (error || (response && response.statusCode !== 200)) {
          handleError(session, MESSAGES.ERROR);
          return;
        }
    
        const data = JSON.parse(body);
    
        if (data && data.length) {
          if (data.indexOf(fromId) > -1) {
            resolve();
            return;
          } else {
            handleError(session, MESSAGES.UNAUTH);
            return;
          }
        } else {
          handleError(session, MESSAGES.ERROR);
          return;
        }
      });
    } else {
      resolve();
      return;
    }
  });
}

module.exports = authorization;