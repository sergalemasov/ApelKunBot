import _ = require('lodash');
import { jsonRequest, IRequestOptions }  from '../utils/json-request';
import { IRepo } from '../entities/repo';

const guthubApiUrl: string = 'https://api.github.com';
const gitlabApiUrl: string = 'https://git.epam.com/api/v3';
const reposUrl: string = 'https://ng2-app.firebaseio.com/repos.json';
const repoTypes = {
  HUB: 1,
  LAB: 2
};

export default class GitObserver {
  private repos: IRepo[];
  private days: number;

  static errorCodes = {
    PARSE: 1,
    HTTP: 2
  };

  public getCriminals(days): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.getRepos()
        .then((repos) => {
          resolve(
            Promise.all(_.map(repos, this.handleRepo.bind(this, days)))
          );
        }, (error) => {
          reject({
            errorCode: GitObserver.errorCodes.HTTP,
            statusCode: error.statusCode
          });
        });
    });
  }

  private getRepos(force: boolean = false): Promise<any> {
    if (!force && this.repos) {
      return Promise.resolve(this.repos);
    }

    return new Promise((resolve, reject) => {
      const options: IRequestOptions = {
        url: reposUrl
      }

      jsonRequest(options)
        .then(repos => {
          this.repos = repos;
          resolve(repos);
        })
        .catch(reject);
    });
  }

  private handleRepo(days: number, repo: IRepo): Promise<any> {
    let handler;
    switch (repo.repoType) {
      case repoTypes.LAB:
        handler = this.handleGitlabRepo;
        break;
      case repoTypes.HUB:
        handler = this.handleGithubRepo;
        break;
    }
    return new Promise((resolve, reject) => {
      handler(repo)
        .then((dateString: string) => {
          resolve(this.handleSuccessRepo(repo, days, dateString));
        })
        .catch((error: any) => {
          reject(this.handleErrorRepo(repo, error));
        });
    })

  }

  private handleSuccessRepo(repo: IRepo, days: number, dateString: string) {
    if (!dateString) {
      throw {
        name: repo.name,
        errorCode: GitObserver.errorCodes.PARSE
      };
    }

    let commitMsec: number = Date.parse(dateString);

    if (repo.repoType === repoTypes.HUB) {
      commitMsec += 3600000 * 4;   // adding GMT
    }

    return this.isLate(commitMsec, days) ? repo.name : '';
  }

  private handleErrorRepo(repo: IRepo, error: any) {
    if (error.errorCode) {
      return error;
    }

    if (error.statusCode) {
      return {
        name: repo.name,
        errorCode: GitObserver.errorCodes.HTTP,
        statusCode: error.statusCode
      }
    }
  }

  private handleGitlabRepo (repo: IRepo): Promise<string> {
    const projectId: string = encodeURIComponent(`${repo.owner}/${repo.repo}`);
    const requestOptions: IRequestOptions = {
      url: gitlabApiUrl + `/projects/${projectId}/repository/commits?per_page=1`,
      headers: {
        'User-Agent': 'request',
        'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
      }
    };

    return new Promise((resolve, reject) => {
      jsonRequest(requestOptions)
        .then((response) => {
          resolve(
            (
              response &&
              response.length &&
              response[0].committed_date
            ) || ''
          );
        })
        .catch(reject);
    });
  }

  private handleGithubRepo (repo: IRepo): Promise<string> {
    const requestOptions: IRequestOptions = {
      url: guthubApiUrl + `/repos/${repo.owner}/${repo.repo}/commits?per_page=1`,
      headers: {
        'User-Agent': 'request',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    };

    return new Promise((resolve, reject) => {
      jsonRequest(requestOptions)
        .then((response) => {
          resolve(
            (
              response &&
              response.length &&
              response[0].commit &&
              response[0].commit.committer &&
              response[0].commit.committer.date
            ) || ''
          );
        })
        .catch(reject);
    });
  }

  private isLate(commitMsec: number, days: number) {
    const deltaMsec: number = days * 24 * 60 * 60 * 1000;
    const nowMsec: number = Date.now();

    return (commitMsec + deltaMsec) < nowMsec;
  }
}
