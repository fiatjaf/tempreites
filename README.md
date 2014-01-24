### [DEMO](http://jsfiddle.net/fiatjaf/mSEZ6/)
### [Comparison with Mustache](http://jsperf.com/tempreites-vs-mustache/4)

# Tempreites

Crude string templating without any syntax, just semantic HTML.

## Usage

Get this as a string, 

```html
<div id="austrianeconomics">
  <h1 class="title"></h1>
  <ul id="theories">
    <li>
      <span class="author"></span>
      <span>
        <a class="theory" 
           data-bind-here="href"
           data-bind-there="url">
        </a>
      </span>
    </li>
  </ul>
</div>
```

attach data to it,

```javascript
var data = {
  title: 'Austrian economists and their theories',
  theories: [
    { author: 'Menger', theory: 'Subjective value', url: '/subj' },
    { author: 'Hayek', theory: 'Austrian Business Cycle Theory', url: '/abct' },
    { author: 'Kirzner', theory: 'Sheer ignorance and entrepreneurship', url: '/entre' },
  ]
}

tempreites.render(template, data)
```

get this back:

```html
<div id="austrianeconomics">
  <h1 class="title"></h1>
  <ul id="theories">
    <li>
      <span class="author">Menger</span>
      <span>
        <a class="theory" 
           data-bind-here="href"
           data-bind-there="url"
           href="/subj">
          Subjective value
        </a>
      </span>
    </li>
    <li>
      <span class="author">Hayek</span>
      <span>
        <a class="theory" 
           data-bind-here="href"
           data-bind-there="url"
           href="/abct">
          Austrian Business Cycle Theory
        </a>
      </span>
    </li>
    <li>
      <span class="author">Kirzner</span>
      <span>
        <a class="theory" 
           data-bind-here="href"
           data-bind-there="url"
           href="/entre">
          Sheer ignorance and entrepreneurship
        </a>
      </span>
    </li>
  </ul>
</div>
```

## Features

* __Semantic data binding__ - No need for <%=foo%> or {{foo}} assignments
* __Collection rendering__ - No need for hand-written loops
* __Valid HTML templates__ - Write templates as a part of the HTML, in plain HTML
* __View logic in JavaScript__ - No crippled micro-template language, just plain JavaScript functions

## TODOs:

* _Basic optmization_
* _Read some `data-` attr to see in which element arrays of data will duplicate_

## Installation

```
npm install tempreites
```

Or download the [file](https://raw.github.com/fiatjaf/tempreites/master/dist/tempreites.js) and include it anywhere.

---

## Documentation

Considering a `data` object like this:
```javascript
var data = {
  name: 'Miyamoto',
  link: '/miyamoto',
  completeName: {
    first: 'Shigeru'
    last: 'Miyamoto'
  },
  sons: [{ name: 'Mario', show: true }, { name: 'Luigi', show: false }]
  show: true
}
Tempreites.render(template, data)
```

#### Binding values

Use a `class` or an `id` at the target element with the value of the key in your `data` object.
```html
<h1 class="name"></h1>
```

#### Nested objects

Use a `class` or an `id` at some element with the value of the parent key in your `data` object, then use a `class` or `id` with the child key anywhere inside the parent element.
```html
<div id="name">
  <h1>
    <span class="last"></span>, <span class="first"></span></h1>
  </h1>
</div>
```

#### Nested lists

Use a `class` or an `id` at the element immediattely before the element you want to be repeated with the list values, then use a `class` or `id` with the child key anywhere inside it.
```html
<div id="sons">
  <p class="name"></p>
</div>
```

#### Binding values to attributes

Use the `data-bind` attribute with the special syntax "javascriptObjectAttrName - > htmlElementAttrNameToBindTo". If you want to bind to more than one attr, write the other bindings at the same `data-bind`, separated by a `|`:
```html
<header>
  <h1 id="name"></h1>
  <img data-bind="url -> src | name -> alt">
</header>
```

#### Conditional showing of elements

Use the `data-show-if` attr naming a key at the `data` object which will be tested for deciding if the element
will be shown or not.
```html
<div id="miyamoto" data-show-if="show">
  <ul class="sons">
    <li class="name" data-show-if="show"></li>
  </ul>
</div>
```

#### Pre-compiling templates

Call the `compile` function to get a pre-compiled template to which you can just pass the data later.
```javascript
var tpr = Tempreites.compile('<div class="u"></div>')
tpr.render({u: 'a'})
tpr.render({u: 'b'})
```

---

Inspired by [Plates](https://github.com/flatiron/plates) and [Transparency](https://github.com/leonidas/transparency/), but simplified and more useful.

---

Written with regular expressions, como se fazia antigamente lá na roça.
