const request = require('request');
const authorization = require('./authorization');

const dataUrl = 'https://ng2-app.firebaseio.com/announcement.json';
const MESSAGES = {
  ERROR: 'Ошибка :('
}

let interval;

function start(session) {
  stop();

  request({
    url: dataUrl
  }, function (error, response, body) {
    if (error || (response && response.statusCode !== 200)) {
      handleError(session);
      return;
    }

    const data = JSON.parse(body);

    if (data && data.text && data.interval) {
      session.send(data.text);
      interval = setInterval(() => {
        session.send(data.text);
      }, data.interval);
    } else {
      handleError(session);
    }
  });
}

function stop() {
  clearInterval(interval);
}

function handleError(session) {
  session.send(MESSAGES.ERROR);
}

function announcement(session) {
  if (!session) {
    return;
  }

  let isAnnouncementStart = /^(?:@ApelKunBot\s)?(announcement)(?:\s(\d))?$/.exec(session.message.text);
  let isAnnouncementEnd = /^(?:@ApelKunBot\s)?(stop)(?:\s(\d))?$/.exec(session.message.text);

  if (!isAnnouncementStart && !isAnnouncementEnd) {
    return;
  }

  authorization(session)
    .then(()=>{
      isAnnouncementStart ? start(session) : stop();
    });
}

module.exports = announcement;