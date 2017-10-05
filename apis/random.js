function random(session) {
  var names = [
    'Стас',
    'Влад',
    'Вадим',
    'Сережа'
  ];

  var match = /^(?:@ApelKunBot\s)?(who\?)?$/.exec(session.message.text);

  if (match) {
    session.send("Итак, доклад проведет для нас: " + names[Math.floor(Math.random() * names.length)]);
  }

}

module.exports = random;