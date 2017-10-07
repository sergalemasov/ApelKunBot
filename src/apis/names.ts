import { capitalizeFirstLetter } from '../utils/helpers';

function names(session) {
  var names = [
    'рома',
    'стас'
  ];

  var message = '';
  names.some(function(name) {
    if (session.message.text.indexOf(name) > -1) {
      message = `Кто тебе сказал, сука, что это имя так пишется? Правильно писать: ${capitalizeFirstLetter(name)}`;
      return true;
    }
  });

  return message;
}

export default names;