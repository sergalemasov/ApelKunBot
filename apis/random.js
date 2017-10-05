function random(session) {
  var mentors = [
    'Stas Osipov',
    'Vlad Mironov',
    'Vadim Gorsky',
    'Sergey Alemasov'
  ];

  var allDevs = [
    'Stas Osipov',
    'Vlad Mironov',
    'Vadim Gorsky',
    'Sergey Alemasov',
    'Vlad Danilov',
    'Viktor Vavilov',
    'Ramil Baltachev',
    'Ilias Musin',
    'Pavel Kazakov'
  ];

  var mentees = [
    'Vlad Danilov',
    'Viktor Vavilov',
    'Ramil Baltachev',
    'Ilias Musin',
    'Pavel Kazakov'
  ];

  var matchLeads = /^(?:@ApelKunBot\s)?(who\? leads)?$/.exec(session.message.text);
  var matchDevs = /^(?:@ApelKunBot\s)?(who\? devs)?$/.exec(session.message.text);
  var matchAll = /^(?:@ApelKunBot\s)?(who\? all)?$/.exec(session.message.text);

  if (matchLeads) {
    session.send('Bot has chosen ' + mentors[Math.floor(Math.random() * mentors.length)] + '. You now you should fulfill Roman\'s desire');
  } else if (matchDevs) {
    session.send('Bot has chosen ' + allDevs[Math.floor(Math.random() * allDevs.length)] + '. You now you should fulfill Roman\'s desire');
  } else if (matchAll) {
  session.send('Bot has chosen ' + mentees[Math.floor(Math.random() * mentees.length)] + '. You now you should fulfill Roman\'s desire');
  }


}

module.exports = random;