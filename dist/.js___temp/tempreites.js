define(function (require, exports, module) {
  

var htmlparser = function () {
      var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[\w-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/, endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/, attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
      var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
      var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");
      var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");
      var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
      var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
      var special = makeMap("script,style");
      this.parse = function (html, handler) {
        var index, chars, match, stack = [], last = html;
        stack.last = function () {
          return this[this.length - 1];
        };
        while (html) {
          chars = true;
          if (!stack.last() || !special[stack.last()]) {
            if (html.indexOf("<!--") == 0) {
              index = html.indexOf("-->");
              if (index >= 0) {
                if (handler.comment)
                  handler.comment(html.substring(4, index));
                html = html.substring(index + 3);
                chars = false;
              }
            } else if (html.indexOf("</") == 0) {
              match = html.match(endTag);
              if (match) {
                html = html.substring(match[0].length);
                match[0].replace(endTag, parseEndTag);
                chars = false;
              }
            } else if (html.indexOf("<") == 0) {
              match = html.match(startTag);
              if (match) {
                html = html.substring(match[0].length);
                match[0].replace(startTag, parseStartTag);
                chars = false;
              }
            }
            if (chars) {
              index = html.indexOf("<");
              var text = index < 0 ? html : html.substring(0, index);
              html = index < 0 ? "" : html.substring(index);
              if (handler.chars)
                handler.chars(text);
            }
          } else {
            html = html.replace(new RegExp("(.*)</" + stack.last() + "[^>]*>"), function (all, text) {
              text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
              if (handler.chars)
                handler.chars(text);
              return "";
            });
            parseEndTag("", stack.last());
          }
          if (html == last)
            throw "Parse Error: " + html;
          last = html;
        }
        parseEndTag();
        function parseStartTag(tag, tagName, rest, unary) {
          tagName = tagName.toLowerCase();
          if (block[tagName]) {
            while (stack.last() && inline[stack.last()]) {
              parseEndTag("", stack.last());
            }
          }
          if (closeSelf[tagName] && stack.last() == tagName) {
            parseEndTag("", tagName);
          }
          unary = empty[tagName] || !!unary;
          if (!unary)
            stack.push(tagName);
          if (handler.start) {
            var attrs = [];
            rest.replace(attr, function (match, name) {
              var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : "";
              attrs.push({
                name: name,
                value: value,
                escaped: value.replace(/(^|[^\\])"/g, "$1\\\"")
              });
            });
            if (handler.start)
              handler.start(tagName, attrs, unary);
          }
        }
        function parseEndTag(tag, tagName) {
          if (!tagName)
            var pos = 0;
          else
            for (var pos = stack.length - 1; pos >= 0; pos--)
              if (stack[pos] == tagName)
                break;
          if (pos >= 0) {
            for (var i = stack.length - 1; i >= pos; i--)
              if (handler.end)
                handler.end(stack[i]);
            stack.length = pos;
          }
        }
      };
      function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
          obj[items[i]] = true;
        return obj;
      }
      return { parse: this.parse };
    }();
  if (!Array.isArray) {
    Array.isArray = function (vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }
  var xmldefuse = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  };
  var renderElement = function (element) {
    var output = "";
    var e = element;
    var sonsDatalevel = [];
    var renderedSons = [];
    if (e.sonsRef && e.datalevel[e.sonsRef] && typeof e.datalevel[e.sonsRef] === "object") {
      if (Array.isArray(e.datalevel[e.sonsRef])) {
        for (var h = 0; h < e.datalevel[e.sonsRef].length; h++) {
          for (var l = 0; l < e.sons.length; l++) {
            var son = e.sons[l];
            son.datalevel = e.datalevel[e.sonsRef][h];
            renderedSons.push(renderElement(son));
          }
        }
      } else {
        var sonData = e.datalevel[e.sonsRef];
        for (var l = 0; l < e.sons.length; l++) {
          var son = e.sons[l];
          son.datalevel = sonData;
          renderedSons.push(renderElement(son));
        }
      }
    } else {
      for (var l = 0; l < e.sons.length; l++) {
        var son = e.sons[l];
        son.datalevel = e.datalevel;
        renderedSons.push(renderElement(son));
      }
    }
    var content = e.content;
    if (e.contentRef) {
      if (typeof e.datalevel[e.contentRef] === "string" || typeof e.datalevel[e.contentRef] === "number") {
        content = e.datalevel[e.contentRef];
      }
    }
    if (e.dataAttrRef.dataKey && e.dataAttrRef.htmlAttr) {
      if (typeof e.datalevel[e.dataAttrRef.dataKey] === "string" || typeof e.datalevel[e.dataAttrRef.dataKey] === "number") {
        e.attrs[e.dataAttrRef.htmlAttr] = e.datalevel[e.dataAttrRef.dataKey];
      }
    }
    var attrs = [];
    for (var key in e.attrs) {
      attrs.push(key + "=\"" + e.attrs[key] + "\"");
    }
    var attrsString = " " + attrs.join(" ");
    var elementString = e.open + attrsString + e.close + content + renderedSons.join(" ") + e.end + "\n";
    output += elementString;
    return output;
  };
  return {
    render: function (template, data) {
      var openedElements = [];
      var htmlresult = "";
      htmlparser.parse(template, {
        start: function (tag, attrs, unary) {
          var father = openedElements.slice(-1)[0] || {};
          var element = {
              datalevel: father.datalevel || data,
              tag: tag,
              multiple: false,
              open: "<" + tag,
              attrs: {},
              dataAttrRef: {},
              content: "",
              contentRef: null,
              end: "",
              sons: []
            };
          for (var i = 0; i < attrs.length; i++) {
            var key = attrs[i].name;
            var value = attrs[i].escaped;
            if (key === "data-bind-here") {
              element.dataAttrRef.htmlAttr = value;
            }
            if (key === "data-bind-there") {
              element.dataAttrRef.dataKey = value;
            }
            if (key === "class") {
              element.contentRef = value;
              element.sonsRef = value;
            }
            if (key === "id") {
              element.contentRef = value;
              element.sonsRef = value;
            }
            for (var c = 0; c < element.numberOfSiblings; c++) {
              element.attrs[key] = value;
            }
          }
          if (unary) {
            element.close = "/>";
            openedElements.slice(-1)[0].sons.push(element);
          } else {
            element.close = ">";
            openedElements.push(element);
          }
        },
        chars: function (text) {
          var element = openedElements.slice(-1)[0];
          if (!element || element.end) {
            return;
          }
          element.content = text;
        },
        end: function (tag) {
          var element = openedElements.slice(-1)[0];
          element.end = "</" + tag + ">";
          var father = openedElements.slice(-2, -1)[0];
          if (father && !father.sons) {
            father.sons = [];
          }
          if (father && father.sons) {
            father.sons.push(element);
          }
          var elem = openedElements.pop();
          if (!openedElements.length) {
            htmlresult = renderElement(elem);
          }
        }
      });
      return htmlresult;
    }
  };


})