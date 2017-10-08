import { Session } from 'botbuilder';
import petrovich = require('petrovich');

import MessageHandler from '../utils/message-handler';
import GitObserver from './git-observer';

export default class Waffles extends MessageHandler {
  constructor(private gitObserver: GitObserver) {
    super();
  }

  protected respond(session: Session): Promise<string> {
    return new Promise((resolve, reject) => {
      const match = /^вафельки(?:\s(\d))?$/.exec(session.message.text);
      if (!match) {
        resolve(null);
        return;
      }

      const days = this.getDays(match[1]);

      this.gitObserver.getCriminals(days)
        .then((criminals: string[]) => {
          resolve(this.handleCriminals(criminals, days));
        })
        .catch((error: any) => {
          resolve(this.handleError(error))
        });
    });
  }

  private getDays(daysString: string): number {
    const maxDays = 7;
    const minDays = 1;
    const defaultDays = 5;
    const days: number = daysString !== undefined && parseInt(daysString);

    return (days && days <= maxDays && days >= minDays) ? days : defaultDays;
  }

  private correctDaysEnding(days: number): string {
    switch (days) {
      case 1:
        return 'дня';
      default:
        return 'дней';
    }
  }

  private handleCriminals(criminals: string[], days: number): string {
    let message: string = `В течение ${days} ${this.correctDaysEnding(days)} `;

    if ( !criminals.some((criminal: string): boolean => !!criminal) ) {
      return message + 'все чето делали, вафли нипаедим :(';
    } else {
      criminals = criminals.filter((criminal: string): boolean => !!criminal);
      const ending: string = criminals.length > 1 ? 'и' : '';
      const ending2: string = criminals.length > 1 ? 'ат' : 'ит';

      return `${message} ${criminals.join(', ')} нихера не делал${ending}, посему пусть тащ${ending2} вафли черт побери!`;
    }
  }

  private handleError(error: any): string {
    switch (error.errorCode) {
      case GitObserver.errorCodes.HTTP:
        if (error.name) {
          return this.handleHttpError(error.name, error.statusCode);
        } else {
          return this.handleAnonymousHttpError(error.statusCode);
        }
      case GitObserver.errorCodes.PARSE:
        return this.handleParseDateError(error.name);
    }
  }

  private handleHttpError(name: string, code: number): string {
    const message: string = `Сорян, не смог вытянуть репозиторий у ${petrovich.male.first.genitive(name, 'genitive')} код ошибки: ${code}. Поэтому вафли торчит он!`;
    return message;
  }

  private handleAnonymousHttpError(code: number): string {
    const message: string = 'Не смог достучаться в firebase, вафли несет Стас XD';
    return message;
  }

  private handleParseDateError(name: string): string {
    const message: string = `Не смог вытянуть коммит/дату у ${petrovich.male.first.genitive(name, 'genitive')}. Поэтому вафли торчит он!`;
    return message
  }
}