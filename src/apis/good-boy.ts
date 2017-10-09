import fs = require('fs');
import path = require('path');
import { Session, Message } from 'botbuilder';
import MessageHandler from '../utils/message-handler';

export default class GoodBoy extends MessageHandler {
  protected handleBotMessage(session: Session): Promise<string|Message> {
    return new Promise((resolve, reject) => {
      const match = /^good\sboy!?$/.exec(session.message.text);
      if (!match) {
        resolve(null);
        return;
      }

      resolve(this.readGoodBoy(session));
    });
  }

  private readGoodBoy(session: Session): Promise<string|Message> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../assets/img/good_boy.jpg'), function(err, data) {
        if (err) {
          resolve('I am not a good boy!');
          return;
        }
        const contentType = 'image/png';
        const base64 = Buffer.from(data).toString('base64');

        resolve(
          new Message(session).addAttachment({
            contentType: contentType,
            contentUrl: `data:${contentType};base64,${base64}`,
            name: 'goodboy.png'
          })
        );
      });
    });
  }
}