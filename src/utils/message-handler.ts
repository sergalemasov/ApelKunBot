import { Session, Message } from 'botbuilder';

export default abstract class MessageHandler {
  private botNameRegex: RegExp;

  constructor() {
    this.botNameRegex = new RegExp('^(?:@ApelKunBot\\s)?(.*)$');
  }

  public handleMessage(session: Session) {
    this.stripBotName(session);

    this.handleBotMessage(session)
      .then(response => {
        if (response) {
          session.send(response);
        }
      });
  }

  private stripBotName(session: Session): void {
    session.message.text = session.message.text.replace(this.botNameRegex, '$1');
  }

  protected abstract handleBotMessage(session: Session): Promise<Message|string>
}