import { Session } from 'botbuilder';
import MessageHandler from '../utils/message-handler';

export default class DaVed extends MessageHandler {
  protected handleBotMessage(session: Session): Promise<string> {
    return new Promise((resolve, reject) => {
      const match = /^да\sведь\?$/.exec(session.message.text);
      if (!match) {
        resolve(null);
        return;
      }

      resolve(`да, ${session.message.user.name}, я абсолютно с тобой согласен!`);
    });
  }
}