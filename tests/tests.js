test('Basic', function () {
  var res;

  res = Tempreites.render('<div><h2 id="plu"></h2></div>', {plu: 'plu'});
  equal($(res).find('h2').text(), 'plu', 'Basic render with id ok');
});

test('Lists', function () {
  var res;

  res = Tempreites.render('<ul id="list"><li class="_this"></li></ul>', {
    list: ['a', 'b', 'c']
  });
  equal($(res).find('li').length, 3, 'Correct number of list items.');
  equal($(res).find('li').eq(0).text(), 'a', 'Rendered list of strings.');

  res = Tempreites.render('<select><option></option><optgroup class="options"><option class="value" data-bind-here="value" data-bind-there="value"></option></optgroup></select>', {options: [{value: 'x'}, {value: 'y'}, {value: 'z'}]});
  equal($(res).find('option').length, 4, 'Options rendering inside optgroup with attribute: correct number of options rendered.');
  equal($(res).find('optgroup option').eq(1).text(), 'y', 'Correct order.');
  equal($(res).find('optgroup option').eq(2).val(), 'z', 'Correct binding to "value".');
});

test('Attributes', function () {
  var res;

  res = Tempreites.render('<img data-bind="src -> src | text -> rel">', {
    src: 'http://plu.com/img.png',
    text: 'a image'
  });
  equal($(res).attr('src'), 'http://plu.com/img.png', 'Correct attr img.');
  equal($(res).attr('rel'), 'a image', 'Correct attr text.');
});
