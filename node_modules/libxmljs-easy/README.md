libxmljs-easy
=============

libxmljs-easy is a Node.js module which simplifies XML traversing,
similar to [E4X](http://en.wikipedia.org/wiki/ECMAScript_for_XML).

[![Build Status](https://secure.travis-ci.org/vgrichina/libxmljs-easy.png?branch=master)](http://travis-ci.org/vgrichina/libxmljs-easy)

Installation
------------

     npm install libxmljs-easy

Usage
-----

Use module

     var easy = require("libxmljs-easy");

Parse XML

     var xml = easy.parse('<books><book name="Lord of the Rings">' +
                             '<author name="J. R. R. Tolkien" />' +
                             '<language>English</language>' +
                          '</book></books>');


Select elements from collections explicitly

     assert.equal(xml.book[0].$name, "Lord of the Rings");
     assert.equal(xml.book[0].author[0].$name, "J. R. R. Tolkien");

Use shorthands (works well for case when there is single child element with given name)

     assert.equal(xml.book.$name, "Lord of the Rings");
     assert.equal(xml.book.author.$name, "J. R. R. Tolkien");

Basically the idea is that you construct a path from tag names,
which can optionally end with attribute name prefixed with "$".

When index is ommited – the array of elements is matched.
When attribute is accessed on such array, its value is concatenated string
of attribute values for each of elements in the array.

There is also original DOM element available as "$" property
of individual converted elements.

     assert.equal(xml.book.language[0].$.text(), "English");

Further info
------------

* [Annotated source with docs](http://vgrichina.github.com/libxmljs-easy/docs/main.html),
generated using [Docco](http://jashkenas.github.com/docco/)
* [Unit tests](https://github.com/vgrichina/libxmljs-easy/blob/master/test.js)
