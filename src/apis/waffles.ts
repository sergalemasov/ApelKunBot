
import request = require('request');
import { Session } from 'botbuilder';
const petrovich: any = require('petrovich');

const guthubApiUrl: string = 'https://api.github.com';
const gitlabApiUrl: string = 'https://git.epam.com/api/v3';

type Repo = {
  name: string;
  owner: string;
  repo: string;
  repoType: repoTypes
};

type Reject = (reason?: any) => void;
type ResolveString = (value?: string | PromiseLike<string>) => void;
type ResolveStringNull = (value?: string | null | PromiseLike<string|null>) => void;

enum repoTypes {
  HUB,
  LAB
};

const repos: Repo[] = [
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
    repo: 'angular2ment',
    repoType: repoTypes.HUB
  },
  {
    name: 'Влад',
    owner: 'Vladislav_Danilov',
    repo: 'angular2.mentoring',
    repoType: repoTypes.LAB
  }
];

let DAYS: number;

function correctDaysEnding(days: number): string {
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

function isLate(commitMsec: number, days: number): boolean {
  const deltaMsec: number = days * 24 * 60 * 60 * 1000;
  const nowMsec: number = Date.now();

  return (commitMsec + deltaMsec) < nowMsec;
}

function handleHttpError(reject: Reject, name: string, code: number): void {
  const message: string = `Сорян, не смог вытянуть репозиторий у ${petrovich.male.first.genitive(name, 'genitive')} код ошибки: ${code}. Поэтому вафли торчит он!`;
  reject(message);
}

function handleParseDateError(reject: Reject, name: string): void {
  const message: string = `Не смог вытянуть коммит/дату у ${petrovich.male.first.genitive(name, 'genitive')}. Поэтому вафли торчит он!`;
  reject(message);
}

function handleGitlabRepo (repo: Repo): Promise<string> {
  const promise: Promise<string> = new Promise((resolve: ResolveString, reject: Reject) => {
    const projectId: string = encodeURIComponent(`${repo.owner}/${repo.repo}`);

    const requestOptions: request.OptionsWithUrl = {
      url: gitlabApiUrl + `/projects/${projectId}/repository/commits?per_page=1`,
      headers: {
        'User-Agent': 'request',
        'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
      }
    };
    request(requestOptions, function (error: any, response: request.RequestResponse, body: any) {
      if (response && response.statusCode !== 200) {
        handleHttpError(reject, repo.name, response.statusCode);
        return;
      }

      // TODO: describe DTO
      const parsedResponse: any = JSON.parse(body);

      const dateString: string = (
        parsedResponse &&
        parsedResponse.length &&
        parsedResponse[0].committed_date
      ) || '';

      if (!dateString) {
        handleParseDateError(reject, repo.name);
        return;
      }

      const commitMsec: number = Date.parse(dateString);
      if (isLate(commitMsec, DAYS)) {
        resolve(repo.name);
      } else {
        resolve('');
      }
    });
  });
  return promise;
}

function handleGithubRepo (repo: Repo): Promise<string> {
  const promise: Promise<string> = new Promise((resolve: ResolveString, reject: Reject) => {
    const requestOptions: request.OptionsWithUrl = {
      url: guthubApiUrl + `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(requestOptions, function (error: any, response: request.RequestResponse, body: any) {
      if (response && response.statusCode !== 200) {
        handleHttpError(reject, repo.name, response.statusCode);
        return;
      }

      // TODO: describe DTO
      const parsedResponse: any = JSON.parse(body);
      const dateString: string = (
        parsedResponse &&
        parsedResponse.length &&
        parsedResponse[0].commit &&
        parsedResponse[0].commit.committer &&
        parsedResponse[0].commit.committer.date
      ) || '';

      if (!dateString) {
        handleParseDateError(reject, repo.name);
        return;
      }

      const commitMsec: number = Date.parse(dateString) + 3600000 * 4;   // adding GMT
      if (isLate(commitMsec, DAYS)) {
        resolve(repo.name);
      } else {
        resolve('');
      }
    });
  });
  return promise;
}

function handleRepo(repo: Repo): Promise<string> {
  switch (repo.repoType) {
    case repoTypes.HUB:
      return handleGithubRepo(repo);
    case repoTypes.LAB:
      return handleGitlabRepo(repo);
  }
}

function waffles(session: Session): Promise<string|null> {
  const promise: Promise<string|null> = new Promise(function (resolve: ResolveStringNull) {
    if (!session) {
      resolve(null);
      return;
    }

    const match: RegExpExecArray = /^(?:@ApelKunBot\s)?(вафельки)(?:\s(\d))?$/.exec(session.message.text);

    if (!match) {
      resolve(null);
      return;
    }

    const days: number = match[2] !== undefined && parseInt(match[2]);
    DAYS = (days && days < 8 && days > 0) ? days : 5;

    Promise.all(repos.map(handleRepo))
      .then((criminals: string[]) => {
        const message: string = `В течение ${DAYS} ${correctDaysEnding(DAYS)} `;

        if ( !criminals.some((criminal: string): boolean => !!criminal) ) {
          resolve( message + 'все чето делали, вафли нипаедим :(' );
        } else {
          criminals = criminals.filter((criminal: string): boolean => !!criminal);
          const ending: string = criminals.length > 1 ? 'и' : '';
          const ending2: string = criminals.length > 1 ? 'ат' : 'ит';

          resolve(`${message} ${criminals.join(', ')} нихера не делал${ending}, посему пусть тащ${ending2} вафли черт побери!`);
        }
      })
      .catch((err: string) => {
        resolve(err);
      });
  });

  return promise;
}

//waffles();

export default waffles;