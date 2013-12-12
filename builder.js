
var htmlparser = function () {
  /*
   * HTML Parser By John Resig (ejohn.org) @ http://ejohn.org/files/htmlparser.js
   * Original code by Erik Arvidsson, Mozilla Public License
   * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
   *
   */

  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[\w-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
    
  // Empty Elements - HTML 4.01
  var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

  // Block Elements - HTML 4.01
  var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

  // Inline Elements - HTML 4.01
  var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

  // Attributes that have their values filled in disabled="disabled"
  var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

  // Special Elements (can contain anything)
  var special = makeMap("script,style");

  this.parse = function( html, handler ) {
    var index, chars, match, stack = [], last = html;
    stack.last = function(){
      return this[ this.length - 1 ];
    };

    while ( html ) {
      chars = true;

      // Make sure we're not in a script or style element
      if ( !stack.last() || !special[ stack.last() ] ) {

        // Comment
        if ( html.indexOf("<!--") == 0 ) {
          index = html.indexOf("-->");
  
          if ( index >= 0 ) {
            if ( handler.comment )
              handler.comment( html.substring( 4, index ) );
            html = html.substring( index + 3 );
            chars = false;
          }
  
        // end tag
        } else if ( html.indexOf("</") == 0 ) {
          match = html.match( endTag );
  
          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( endTag, parseEndTag );
            chars = false;
          }
  
        // start tag
        } else if ( html.indexOf("<") == 0 ) {
          match = html.match( startTag );
  
          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( startTag, parseStartTag );
            chars = false;
          }
        }

        if ( chars ) {
          index = html.indexOf("<");
          
          var text = index < 0 ? html : html.substring( 0, index );
          html = index < 0 ? "" : html.substring( index );
          
          if ( handler.chars )
            handler.chars( text );
        }

      } else {
        html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
          text = text.replace(/<!--(.*?)-->/g, "$1")
            .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

          if ( handler.chars )
            handler.chars( text );

          return "";
        });

        parseEndTag( "", stack.last() );
      }

      if ( html == last )
        throw "Parse Error: " + html;
      last = html;
    }
    
    // Clean up any remaining tags
    parseEndTag();

    function parseStartTag( tag, tagName, rest, unary ) {
      tagName = tagName.toLowerCase();

      if ( block[ tagName ] ) {
        while ( stack.last() && inline[ stack.last() ] ) {
          parseEndTag( "", stack.last() );
        }
      }

      if ( closeSelf[ tagName ] && stack.last() == tagName ) {
        parseEndTag( "", tagName );
      }

      unary = empty[ tagName ] || !!unary;

      if ( !unary )
        stack.push( tagName );
      
      if ( handler.start ) {
        var attrs = [];
  
        rest.replace(attr, function(match, name) {
          var value = arguments[2] ? arguments[2] :
            arguments[3] ? arguments[3] :
            arguments[4] ? arguments[4] :
            fillAttrs[name] ? name : "";
          
          attrs.push({
            name: name,
            value: value,
            escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
          });
        });
  
        if ( handler.start )
          handler.start( tagName, attrs, unary );
      }
    }

    function parseEndTag( tag, tagName ) {
      // If no tag name is provided, clean shop
      if ( !tagName )
        var pos = 0;
        
      // Find the closest opened tag of the same type
      else
        for ( var pos = stack.length - 1; pos >= 0; pos-- )
          if ( stack[ pos ] == tagName )
            break;
      
      if ( pos >= 0 ) {
        // Close all the open elements, up the stack
        for ( var i = stack.length - 1; i >= pos; i-- )
          if ( handler.end )
            handler.end( stack[ i ] );
        
        // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  };

  function makeMap(str){
    var obj = {}, items = str.split(",");
    for ( var i = 0; i < items.length; i++ )
        obj[ items[i] ] = true;
    return obj;
  }

  return { parse: this.parse };
}();

/* Array.isArray */
if (!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}
/*  -*-  */

var xmldefuse = function (text) { 
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
} 

var buildElement = function (elementData) {
  var output = ''
  var e = elementData
  for (var i = 0; i < elementData.numberOfSiblings; i++) {

    // build the sons
    var sons = []
    if (e.sons) {
      for (var j = 0; j < e.sons.length; j++) {
        sons.push(buildElement(e.sons[j]))
      }
    }

    var elementString = e.open + ' ' + e.attrs[i].join(' ') + 
                        e.close + e.content[i] + 
                        sons.join(' ') + e.end
    output += elementString
  }
  return output
}

var template = '<div id="habitantes">\n  <div class="atuais">\n    <h1>Habitantes</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th>\n          <th></th>\n          <th></th>\n        </tr>\n      </thead>\n      <tbody class="ativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="antigos">\n    <h1>habitantes antigos</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th> \n          <th></th> \n        </tr> \n      </thead>\n      <tbody class="inativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody> \n    </table>\n  </div>\n</div>\n'
var data = {
  ativos: [{
    quarto: '213',
    nome: 'fulano',
    link: 'fulano.com'
  },{
    quarto: '405',
    nome: 'beltrano',
    link: 'beltrano.com'
  },{
    quarto: '414',
    nome: 'ciclano',
    link: 'ciclano.com'
  }],
  //inativos: []
}
var openedElements = []
var htmlresult = ''

htmlparser.parse(template, {
  start: function (tag, attrs, unary) {
    var father = openedElements.slice(-1)[0] || {}

    var element = {
      tag: tag,
      numberOfSiblings: 1, // here we don't know yet
      open: '<' + tag,
    }


    // default: 
    // create 1 array or attrs
    // ,      1 content string
    // and    1 son's datalevel
    element.attrs = [[]]
    element.content = ['']

    // create the correct number of attrs arrays
    // and content strings
    if (father.multipleSons) {
      element.numberOfSiblings = father.multipleSons

      element.attrs = []
      element.content = []
      for (var r = 0; r < element.numberOfSiblings; r++) {
        element.attrs.push([])
        element.content.push('')
      }
    }

    // see what is the datalevel of the current element
    if (father.datalevelOfMySons && father.datalevelOfMySons.length > 1) {

      // in case this element is a created-by-data sibling of others,
      // get its correspondent datalevel by ignoring the already taken
      element.datalevels = []
      element.datalevelOfMySons = []
      for (var p = 0; p < father.datalevelOfMySons.length; p++) {

        var dl = father.datalevelOfMySons[p]
        if (!dl.taken) {
          element.datalevels.push(dl.datalevel)
          element.datalevelOfMySons.push({taken: false, datalevel: dl.datalevel})
          father.datalevelOfMySons[p].taken = true
        }

      }
      
    }
    else {
      element.datalevel = father.datalevelOfMySons ? 
                          father.datalevelOfMySons[0].datalevel : 
                          data
      element.datalevelOfMySons = [{ datalevel: element.datalevel }]
    }

    var insertAttr = {}

    // scan all it tags and write them
    for (var i = 0; i < attrs.length; i++) {
      var key = attrs[i].name
      var value = attrs[i].escaped
      var arrayOfValues = attrs[i].escapeds

      if (key === 'data-bind-here') {
        insertAttr.name = value

        // finish inserting the attr
        if (insertAttr.escaped || insertAttr.escapeds) {
          // add the attr to this same list being iterated
          attrs.push(insertAttr)
        }
      }
      if (key === 'data-bind-there') {

        // get the value from the data
        if (typeof element.datalevel[value] === 'string' ||
            typeof element.datalevel[value] === 'number') {
          datavalue = element.datalevel[value]
          insertAttr.escaped = xmldefuse(datavalue)
        }
        else if (element.datalevels) {
          insertAttr.escapeds = []
          for (var w = 0; w < element.numberOfSiblings; w++) {
            var siblingData = element.datalevels[w]
            if (typeof siblingData[value] === 'string' ||
                typeof siblingData[value] === 'number') {
              datavalue = siblingData[value]
              insertAttr.escapeds.push(xmldefuse(datavalue))
            }
          }
        }

        // finish inserting the attr
        if (insertAttr.name && insertAttr.escaped) {
          // add the attr to this same list being iterated
          attrs.push(insertAttr)
        }

      }
      if (key === 'class') {
        // if we are looking to an array of data, 
        // look through it
        if (element.datalevels) {

          element.content = []

          for (var w = 0; w < element.numberOfSiblings; w++) {
            
            var siblingData = element.datalevels[w]
            if (typeof siblingData[value] === 'string' ||
                typeof siblingData[value] === 'number') {

              element.content.push(siblingData[value])

            }
            
          }
        }
        // otherwise behave as 'id'
        key = 'id'

      }
      if (key === 'id') {

        // check for this key in the data.
        // if it is a string, insert it in the body of this element
        if (element.datalevel &&
            typeof element.datalevel[value] === 'string' ||
            element.datalevel &&
            typeof element.datalevel[value] === 'number') {
          element.content = [element.datalevel[value]] // only works with 1 sibling
        }

        // if it is an object, change the scope of the data to a lower level
        else if (element.datalevel &&
                 typeof element.datalevel[value] === 'object') {
          var lowerlevel = element.datalevel[value]
          element.datalevelOfMySons = []
          for (var m = 0; m < lowerlevel.length; m++) {
            element.datalevelOfMySons.push({taken: false, datalevel: lowerlevel[m]})
          }
          element.multipleSons = lowerlevel.length
        }

      }

      // insert this attr in the element(s)
      for (var c = 0; c < element.numberOfSiblings; c++) {
        if (arrayOfValues) {
          var value = arrayOfValues[c]
        }
        element.attrs[c].push(key + '="' + value + '"')
      }

    }
    insertAttr = {}

    if (unary) {
      // this does not constitute a standalone element, but rather
      // a content of other element

      // close the tag
      element.close = '/>'

      // add this to the father
      openedElements.slice(-1).sons.push(element)

    }
    else {

      // close the tag
      element.close = '>'

      // add this as the current opened element
      openedElements.push(element)

    }
  },
  chars: function (text) {
    var element = openedElements.slice(-1)[0]
    if (!element || element.end){
      return
    }
    
    // if the current element hasn't data to use 
    // as content, add the default template content instead
    for (var g = 0; g < element.numberOfSiblings; g++) {
      element.content.push(text)
    }

  },
  end: function (tag) {
    var element = openedElements.slice(-1)[0]

    // close the final tag
    element.end = '</' + tag + '>'

    // add the current opened element to its father
    var father = openedElements.slice(-2, -1)[0]
    if (father && !father.sons) {
      father.sons = []
    }
    if (father && father.sons) {
      father.sons.push(element)
    }

    // remove it from the opened list
    var elem = openedElements.pop()

    // if it was the last, build it
    if (!openedElements.length) {
      htmlresult = buildElement(elem)
    }

  },
})

document.getElementById('main').innerHTML = htmlresult

















