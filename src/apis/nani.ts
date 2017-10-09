import fs = require('fs');
import path = require('path');
import { Session, Message } from 'botbuilder';
import MessageHandler from '../utils/message-handler';

export default class Nani extends MessageHandler {
  protected handleBotMessage(session: Session): Promise<string|Message> {
    return new Promise((resolve, reject) => {
      const match = /^nani\?$/.exec(session.message.text);
      if (!match) {
        resolve(null);
        return;
      }

      resolve(this.readNaniAudio(session));
    });
  }

  private readNaniAudio(session: Session): Promise<string|Message> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '../assets/audio/nani.mp3'), function(err, data) {
        if (err) {
          resolve('Omae wa mou shindeiru!');
          return;
        }
        const contentType = 'audio/mpeg';
        const base64 = Buffer.from(data).toString('base64');

        resolve(
          new Message(session).addAttachment({
            contentType: contentType,
            contentUrl: `data:${contentType};base64,${base64}`,
            name: 'Omae wa mou shindeiru.mp3'
          })
        );
      });
    });
  }
}