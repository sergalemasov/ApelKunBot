import {
  Session,
  Message,
  HeroCard,
  CardAction,
  CardImage
} from 'botbuilder';
import MessageHandler from '../utils/message-handler';

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
    var msg = new Message(session)
      .attachments([
        new HeroCard(session)
          .title("Classic Gray T-Shirt")
          .subtitle("100% Soft and Luxurious Cotton")
          .text("Price is $25 and carried in sizes (S, M, L, and XL)")
          .buttons([
            CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
          ])
      ]);
    return msg;
  }
}