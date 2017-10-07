import { Session } from 'botbuilder';
import { capitalizeFirstLetter } from '../utils/helpers';

function names(session: Session): string {
  const names: string[] = [
    'рома',
    'стас'
  ];

  let message: string = '';
  names.some((name: string): boolean => {
    if (session.message.text.indexOf(name) > -1) {
      message = `Кто тебе сказал, сука, что это имя так пишется? Правильно писать: ${capitalizeFirstLetter(name)}`;
      return true;
    }
  });

  return message;
}

export default names;