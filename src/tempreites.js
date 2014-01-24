/*!
 * Tempreites
 *
 * Copyright © 2013 Giovanni Torres Parra | BSD & MIT license | http://github.com/fiatjaf/tempreites
 */

(function (root, factory) {
  'use strict';

  if (typeof exports === 'object') {
    // CommonJS module
    module.exports = factory();
  } 
  else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return factory();
    });
  } 
  else {
    root.Tempreites = factory();
  }
}(this, function () {
    var parseContext = {
      create: function(raw, options) {
        var index = 0;
        var context = {
          text: '',
          peek: function(count) {
            count = count || 1;
            return this.raw.substr(index + 1, count);
          },
          read: function(count) {
            if (count === 0) {
              return '';
            }
            count = count || 1;
            var next = this.peek(count);
            index += count;
            if (index > this.length) {
              index = this.length;
            }
            return next;
          },
          readUntilNonWhitespace: function() {
            var value = '', next;
            while (!this.isEof()) {
              next = this.read();
              value += next;
              if (!/\s$/.test(value)) {
                break;
              }
            }

            return value;
          },
          isEof: function() {
            return index >= this.length;
          },
          readRegex: function(regex) {
            var value = (regex.exec(this.raw.substring(this.index)) || [''])[0];
            index += value.length;
            return value;
          },
          peekIgnoreWhitespace: function(count) {
            count = count || 1;
            var value = '', next = '', offset = 0;
            do {
              next = this.raw.charAt(this.index + ++offset);
              if (!next) {
                break;
              }
              if (!/\s/.test(next)) {
                value += next;
              }
            } while (value.length < count);

            return value;
          }
        };

        context.__defineGetter__('current', function() {
          return this.isEof() ? '' : this.raw.charAt(this.index);
        });
        context.__defineGetter__('raw', function() {
          return raw;
        });
        context.__defineGetter__('length', function() {
          return this.raw.length;
        });
        context.__defineGetter__('index', function() {
          return index;
        });
        context.__defineGetter__('substring', function() {
          return this.raw.substring(this.index);
        });

        context.callbacks = {};
        var types = [ 'openElement', 'closeElement', 'attribute', 'comment', 'cdata', 'text', 'docType', 'xmlProlog', 'closeOpenedElement' ];
        types.forEach(function(value) {
          context.callbacks[value] = options[value] || function() {
          };
        });

        return context;
      }
    }
    var nameRegex = /[a-zA-Z_][\w:-]*/;
    
    function readAttribute(context) {
      var name = context.readRegex(nameRegex);
      var value = null;
      if (context.current === '=' || context.peekIgnoreWhitespace() === '=') {
        context.readRegex(/\s*=\s*/);
        var quote = /['"]/.test(context.current) ? context.current : '';
        var attributeValueRegex = !quote
          ? /(.*?)(?=[\s>])/
          : new RegExp(quote + '(.*?)' + quote);
    
        var match = attributeValueRegex.exec(context.substring) || [0, ''];
        value = match[1];
        context.read(match[0].length);
      }
    
      context.callbacks.attribute(name, value);
    }
    
    function readAttributes(context, isXml) {
      function isClosingToken() {
        if (isXml) {
          return context.current === '?' && context.peek() === '>';
        }
    
        return context.current === '>' || (context.current === '/' && context.peekIgnoreWhitespace() === '>');
      }
      var next = context.current;
      while (!context.isEof() && !isClosingToken()) {
        if (nameRegex.test(next)) {
          readAttribute(context);
          next = context.current;
        }
        else {
          next = context.read();
        }
      }
    }
    
    function readCloserForOpenedElement(context, name) {
      var unary;
      var emptyElements = { 'area': true, 'base': true, 'basefont': true, 'br': true, 'col': true, 'frame': true, 'hr': true, 'img': true, 'input': true, 'isindex': true, 'link': true, 'meta': true, 'param': true, 'embed': true }
      if (name in emptyElements) {
        unary = true;
      }

      if (context.current === '/') {
        //self closing tag "/>"
        context.readUntilNonWhitespace();
        context.read();
        context.callbacks.closeOpenedElement(name, '/>', unary);
      }
      else if (context.current === '?') {
        //xml closing "?>"
        context.read(2);
        context.callbacks.closeOpenedElement(name, '?>', unary);
      }
      else {
        //normal closing ">"
        context.read();
        context.callbacks.closeOpenedElement(name, '>', unary);
      }
    }
    
    function parseOpenElement(context) {
      var name = context.readRegex(nameRegex);
      context.callbacks.openElement(name);
      readAttributes(context, false);
      readCloserForOpenedElement(context, name);
    
      if (!/^(script|xmp)$/i.test(name)) {
        return;
      }
    
      //just read until the closing tags for elements that allow cdata
      var regex = new RegExp('^([\\s\\S]*?)(?:$|</(' + name + ')\\s*>)', 'i');
      var match = regex.exec(context.substring);
      context.read(match[0].length);
      if (match[1]) {
        context.callbacks.cdata(match[1]);
      }
      if (match[2]) {
        context.callbacks.closeElement(match[2]);
      }
    }
    
    function parseEndElement(context) {
      var name = context.readRegex(nameRegex);
      context.callbacks.closeElement(name);
      context.readRegex(/.*?(?:>|$)/);
    }
    
    function parseCData(context) {
      //read "![CDATA["
      context.read(8);
    
      var match = /^([\s\S]*?)(?:$|]]>)/.exec(context.substring);
      var value = match[1];
      context.read(match[0].length);
      context.callbacks.cdata(value);
    }
    
    function parseComment(context) {
      //read "!--"
      context.read(3);
    
      var match = /^([\s\S]*?)(?:$|-->)/.exec(context.substring);
      var value = match[1];
      context.read(match[0].length);
      context.callbacks.comment(value);
    }
    
    function parseDocType(context) {
      //read "!doctype"
      context.read(8);
    
      var match = /^\s*([\s\S]*?)(?:$|>)/.exec(context.substring);
      var value = match[1];
      context.read(match[0].length);
      context.callbacks.docType(value);
    }
    
    function parseXmlProlog(context) {
      //read "?xml"
      context.read(4);
      context.callbacks.xmlProlog();
      readAttributes(context, true);
      readCloserForOpenedElement(context, '?xml');
    }
    
    function appendText(value, context) {
      context.text += value;
    }
    
    function callbackText(context) {
      if (context.text) {
        context.callbacks.text(context.text);
        context.text = '';
      }
    }
    
    function parseNext(context) {
      var current = context.current, buffer = current;
      if (current == '<') {
        buffer += context.read();
        if (context.current === '/') {
          buffer += context.read();
          if (nameRegex.test(context.current)) {
            callbackText(context);
            parseEndElement(context);
          } else {
            //malformed html
            context.read();
            appendText(buffer, context);
          }
        } else if (context.current === '!') {
          if (/^!\[CDATA\[/.test(context.substring)) {
            callbackText(context);
            parseCData(context);
          } else if (/^!--/.test(context.substring)) {
            callbackText(context);
            parseComment(context);
          } else if (/^!doctype/i.test(context.substring)) {
            callbackText(context);
            parseDocType(context);
          } else {
            //malformed html
            context.read();
            appendText(buffer, context);
          }
        } else if (context.current === '?') {
          if (/^\?xml/.test(context.substring)) {
            callbackText(context);
            parseXmlProlog(context);
          } else {
            //malformed xml prolog
            context.read();
            appendText(buffer, context);
          }
        } else if (nameRegex.test(context.current)) {
          callbackText(context);
          parseOpenElement(context);
        } else {
          //malformed html
          context.read();
          appendText(buffer, context);
        }
      } else {
        appendText(context.current, context);
        context.read();
      }
    }

    var parse = function (htmlString, callbacks) {
        htmlString = htmlString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        var context = parseContext.create(htmlString, callbacks);
        do {
          parseNext(context);
        } while (!context.isEof());
        callbackText(context);
    }
    
    /* Array.isArray */
    if (!Array.isArray) {
      Array.isArray = function (vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
      };
    }
    /*  -*-  */

    /* Crockford clone function */
    function clone(o) {
      function F() {}
      F.prototype = o;
      return new F();
    }
    /*  -*-  */
    
    var XMLdefuse = function (text) { 
      if (text.replace) {
        return text.replace(/(<|>|"|'|&)/g, '');
      }
      return text
    } 
    
    var renderElement = function (e, datalevel) {
      var output = ''
      
      // check if it has sons in lower dataleves
      var renderedSons = []
      if (e.sonsRefs.length) {
        for (var i = 0; i < e.sonsRefs.length; i++) {
          if (datalevel[e.sonsRefs[i]] && typeof datalevel[e.sonsRefs[i]] === 'object') {
    
            if (Array.isArray(datalevel[e.sonsRefs[i]])) {
              for (var h = 0; h < datalevel[e.sonsRefs[i]].length; h++) {
                
                // for each part of the array of data-sons
                for (var l = 0; l < e.sons.length; l++) {
                  var son = e.sons[l]
                 
                  // multiply all the static sons with that lower datalevel
                  renderedSons.push(renderElement(son, datalevel[e.sonsRefs[i]][h]))
                }
    
              }
            }
            else {
              // in case of sub-objects, just change the scope and pass it to the
              // previously defined static sons
              var sonData = datalevel[e.sonsRefs[i]]
     
              for (var l = 0; l < e.sons.length; l++) {
                var son = e.sons[l]
                // multiply all the static sons with that lower datalevel
    
                renderedSons.push(renderElement(son, sonData))
              }
            }

            break
          }
        }
    
      }
      // otherwise just render the sons with its same datalevel
      else {
        for (var l = 0; l < e.sons.length; l++) {
          var son = e.sons[l]
          renderedSons.push(renderElement(son, datalevel))
        }
      }
    
      // check for data-driven content
      var content = e.content
      for (var i = 0; i < e.contentRefs.length; i++) {
        if (e.contentRefs[i] === '_this') {
          content = datalevel
        }
        else if (typeof datalevel[e.contentRefs[i]] === 'string' ||
            typeof datalevel[e.contentRefs[i]] === 'number') {
          content = datalevel[e.contentRefs[i]]
          break
        }
      }
    
      // check for data-driven attributes
      var attrsDict = clone(e.attrs)
      if (e.dataAttrRef && e.dataAttrRef.dataKey && e.dataAttrRef.htmlAttr) {
        if (typeof datalevel[e.dataAttrRef.dataKey] === 'string' ||
            typeof datalevel[e.dataAttrRef.dataKey] === 'number') {
          attrsDict[e.dataAttrRef.htmlAttr] = XMLdefuse(datalevel[e.dataAttrRef.dataKey])
        }
      }
    
      // build the attrsString
      var attrs = []
      for (var key in attrsDict) {
        if (attrsDict[key]) {
          attrs.push(key + '="' + attrsDict[key] + '"')
        }
        else {
          attrs.push(key)
        }
      }
      var attrsString = attrs.join(' ')
      if (attrsString) {
        attrsString = ' ' + attrsString
      }

      // if the element had a data-show-if attr and check if it has
      // to be rendered or not before rendering
      if (!e.dataShowRef || e.dataShowRef && datalevel[e.dataShowRef]) {

        // build the element
        var elementString = e.open + attrsString + e.close + content +
                            renderedSons.join(' ') + e.end + '\n'
        output += elementString
      }
    
      return output
    }
  
    return {
  
      render: function (template, data) {
        var compiled = this.compile(template)
        return compiled.render(data)
      },
      compile: function (template) {
        var openedElements = []
        var finalElements = []
  
        parse(template, {

          docType: function (value) {          
            // a doctype will be added anywhere it is find, as it had to appear at the top only

            var attrs = {}
            attrs[value] = null
            var element = {
              tag: '',
              open: '<!doctype',
              close: '>',
              sons: [],
              end: ' ',
              attrs: attrs,
              content: '',
              sonsRefs: [],
              contentRefs: []
            }
            finalElements.push(element)

          },
          openElement: function (tag) {
            // default element creation 

            var element = {
              tag: tag,
              open: '<' + tag,
              attrs: {},
              dataAttrRef: {}, // if this has an attribute to be rendered based on data
              dataShowRef: null, // search this key and only render the element if it exists
              content: '',
              contentRefs: [], // if this has content to be rendered based on data
              sonsRefs: [],
              end: '',
              sons: []
            }
        
            // add this as the current opened element
            openedElements.push(element)

          },
          attribute: function (key, value) {
            var element = openedElements.slice(-1)[0]
        
            if (key === 'data-bind-here') {
              element.dataAttrRef.htmlAttr = value
            }
            if (key === 'data-bind-there') {
              element.dataAttrRef.dataKey = value
            }
            if (key === 'data-show-if') {
              element.dataShowRef = value
            }
            if (key === 'class') {
              var parts = value.split()
              for (var i = 0; i < parts.length; i++) {
                if (parts[i]) {
                  element.contentRefs.push(parts[i])
                  element.sonsRefs.push(parts[i])
                }
              }
            }
            if (key === 'id') {
              element.contentRefs.unshift(value)
              element.sonsRefs.unshift(value)
            }
        
            // insert this attr in the element
            element.attrs[key] = value

          },
          closeOpenedElement: function (tag, token, unary) {  
            var element = openedElements.slice(-1)[0]

            // close the tag
            element.close = token

            if (unary) {
              // as this constitutes just a content of other element, 
              // we must end the element
              element.end = ' ' // (this evaluates to true)
              // add this to the father
              var father = openedElements.slice(-2, -1)[0]
              if (father) {
                father.sons.push(element)
              }
              // if it doesn't have a father, write it
              else {
                finalElements.push(element)
              }

              // remove it from the opened list
              var elem = openedElements.pop()
              // if it was the last, build it
              if (!openedElements.length) {
                finalElements.push(elem)
              }
            }

          },
          text: function (text) {
            // a text is an element without tags
            var father = openedElements.slice(-1)[0]
            var element = {
              tag: '',
              open: ' ',
              close: ' ',
              sons: [],
              end: ' ',
              attrs: {},
              content: text,
              sonsRefs: [],
              contentRefs: []
            }

            // add it to the father
            if (father) {
              father.sons.push(element)
            }
            // if it doesn't have a father, write it
            else {
              finalElements.push(element)
            }

          },
          cdata: function (text) {
            var element = openedElements.slice(-1)[0]
            
            element.content = text

          },
          closeElement: function (tag) {
            var element = openedElements.slice(-1)[0]

            // hope the tag matches
            if (element.tag !== tag) {
              throw new Error('Error matching end tag with previously opened element.\n' + 
                              'opened element: ' + element.tag + '\n' +
                              'closing tag: ' + tag + '\n')
            }
        
            // close the final tag
            element.end = '</' + tag + '>'
        
            // add the current opened element to its father
            var father = openedElements.slice(-2, -1)[0]
            if (father) {
              father.sons.push(element)
            }
        
            // remove it from the opened list
            var elem = openedElements.pop()
        
            // if it was the last, build it
            if (!openedElements.length) {
              finalElements.push(elem)
            }
        
          },
        })
      
        var compiled = {
          elements: finalElements,
          render: function (data) {
            data = data || {}
            var htmlresult = ''
            for (var i = 0; i < this.elements.length; i++) {
              htmlresult += renderElement(this.elements[i], data)
            }
            return htmlresult
          }
        }

        return compiled
      },
    }

}));
