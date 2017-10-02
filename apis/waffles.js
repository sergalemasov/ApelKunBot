
var request = require('request');
var petrovich = require('petrovich');

var guthubApiUrl = 'https://api.github.com';
var gitlabApiUrl = 'https://git.epam.com/api/v3';

var repoTypes = {
  HUB: 1,
  LAB: 2
};

var repos = [
  {
    name: 'Рамиль',
    owner: 'baltachevramil',
    repo: 'angular_2_mentoring',
    repoType: repoTypes.HUB
  },
  {
    name: 'Паша',
    owner: 'KemPavel',
    repo: 'angular2-TODO',
    repoType: repoTypes.HUB
  },
  {
    name: 'Ильяс',
    owner: 'IliasEpam',
    repo: 'A2ment',
    repoType: repoTypes.HUB
  },
  {
    name: 'Виктор',
    owner: 'viktorvavilov',
    repo: 'Angular2Mentoring',
    repoType: repoTypes.HUB
  },
  {
    name: 'Влад',
    owner: 'Vladislav_Danilov',
    repo: 'angular2.mentoring',
    repoType: repoTypes.LAB
  }
];

var DAYS;
var gitlabAT = 'qYhG1gXw1K2Su7Dsf4kp';

function correctDaysEnding(days) {
  switch (days) {
    case 1:
      return 'дня';
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      return 'дней';
  }
}

function isLate(commitMsec, days) {
  var deltaMsec = days * 24 * 60 * 60 * 1000;
  var nowMsec = Date.now();

  return (commitMsec + deltaMsec) < nowMsec;
}

function handleHttpError(reject, name, code) {
  var message = `Сорян, не смог вытянуть репозиторий у ${petrovich.male.first.genitive(name, 'genitive')} код ошибки: ${code}. Поэтому вафли торчит он!`;
  reject(message);
}

function handleParseDateError(reject, name) {
  var message = `Не смог вытянуть коммит/дату у ${petrovich.male.first.genitive(name, 'genitive')}. Поэтому вафли торчит он!`;
  reject(message);
}

function handleGitlabRepo (repo) {
  var promise = new Promise(function(resolve, reject) {
    var projectId = encodeURIComponent(`${repo.owner}/${repo.repo}`);

    var requestOptions = {
      url: gitlabApiUrl + `/projects/${projectId}/repository/commits?per_page=1`,
      headers: {
        'User-Agent': 'request',
        'PRIVATE-TOKEN': gitlabAT
      }
    };
    request(requestOptions, function (error, response, body) {
      if (response && response.statusCode !== 200) {
        handleHttpError(reject, repo.name, response.statusCode);
        return;
      }

      var parsedResponse = JSON.parse(body);
      var dateString = (
        parsedResponse &&
        parsedResponse.length &&
        parsedResponse[0].committed_date
      ) || undefined;

      if (!dateString) {
        handleParseDateError(reject, repo.name);
        return;
      }

      var commitMsec = Date.parse(dateString);
      if (isLate(commitMsec, DAYS)) {
        resolve(repo.name);
      } else {
        resolve('');
      }
    });
  });
  return promise;
}

function handleGithubRepo (repo) {
  var promise = new Promise(function(resolve, reject) {
    var requestOptions = {
      url: guthubApiUrl + `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(requestOptions, function (error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the Google homepage.

      if (response && response.statusCode !== 200) {
        handleHttpError(reject, repo.name, response.statusCode);
        return;
      }

      var parsedResponse = JSON.parse(body);
      var dateString = (
        parsedResponse &&
        parsedResponse.length &&
        parsedResponse[0].commit &&
        parsedResponse[0].commit.committer &&
        parsedResponse[0].commit.committer.date
      ) || undefined;

      if (!dateString) {
        handleParseDateError(reject, repo.name);
        return;
      }

      var commitMsec = Date.parse(dateString) + 3600000 * 4;   // adding GMT
      if (isLate(commitMsec, DAYS)) {
        resolve(repo.name);
      } else {
        resolve('');
      }
    });
  });
  return promise;
}

function handleRepo(repo) {
  switch (repo.repoType) {
    case repoTypes.HUB:
      return handleGithubRepo(repo);
    case repoTypes.LAB:
      return handleGitlabRepo(repo);
  }
}

function waffles(session) {

  var promise = new Promise(function (resolve) {
    if (!session) {
      resolve(null);
      return;
    }

    var match = /^(вафельки)(?:\s(\d))?$/.exec(session.message.text);

    if (!match) {
      resolve(null);
      return;
    }

    var days = match[2] !== undefined && parseInt(match[2]);
    DAYS = days && days < 8 && days > 0 || 5;

    Promise.all(repos.map(handleRepo))
      .then(function (criminals) {
        var message = `В течение ${DAYS} ${correctDaysEnding(DAYS)} `;
        if ( !criminals.some(function (e) {return e}) ) {
          resolve( message + 'все чето делали :(' );
        } else {
          resolve( message + criminals.filter(function (e) {return e}) );
        }
      })
      .catch(function (err) {
        resolve(err);
      });
  });
}

//waffles();

module.exports = waffles;