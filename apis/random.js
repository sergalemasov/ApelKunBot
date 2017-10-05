function random() {
  var names = [
    'Стас',
    'Влад',
    'Вадим',
    'Сережа'
  ];
  
  return "Итак, доклад проведет для нас:" + names[Math.floor(Math.random() * names.length)];
}
