import {
  Session,
  Message,
  HeroCard,
  CardAction,
  CardImage
} from 'botbuilder';
import MessageHandler from '../utils/message-handler';
import sessionService from '../services/session-service';

export default class HttpActionTest extends MessageHandler {
  protected handleBotMessage(session: Session): Promise<string|Message> {
    return new Promise((resolve, reject) => {
      const match = /^test-http?$/.exec(session.message.text);
      if (!match) {
        resolve(null);
        return;
      }

      resolve(this.respond(session));
    });
  }

  private respond(session: Session): Message {
    const sessionId = sessionService.storeSession(session);
    const msg: Message = new Message(session)
      .attachments([
        new HeroCard(session)
          .title('Open url')
          .subtitle('работает')
          .text('как залупа')
          .buttons([
            CardAction.openUrl(session, `${process.env.APP_URL}session/${sessionId}`, 'потомучто открывает браузер')
          ])
      ]);
    return msg;
  }
}