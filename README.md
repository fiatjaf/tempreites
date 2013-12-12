# Tempreites

Crude string templating without any syntax, just semantic HTML.

### [DEMO](http://jsfiddle.net/fiatjaf/mSEZ6/)

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

* _Semantic data binding_ - No need for <%=foo%> or {{foo}} assignments
* _Collection rendering_ - No need for hand-written loops
* _Valid HTML templates_ - Write templates as a part of the HTML, in plain HTML
* _View logic in JavaScript_ - No crippled micro-template language, just plain JavaScript functions

## Installation

```
npm install tempreites
```

Or download the universally loadable [file](https://raw.github.com/fiatjaf/tempreites/master/dist/tempreites.js).

---

Inspired by [Plates](https://github.com/flatiron/plates) and [Transparency](https://github.com/leonidas/transparency/), but simplified and more useful.

---

Written with regular expressions, como se fazia antigamente lá na roça.
