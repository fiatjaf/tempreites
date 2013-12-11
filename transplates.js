
// sven@pimpmybyte.de 
// sven@svenvanbolt.de 
// fischentgraeter@web.de
// github: mk-pmb

var transplates = {
  render: function (html, data, opts) {
    var xmldefuse = function (text) { 
      return text.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&apos;');
    } 
    var renderTemplate = function (data, map, template) { 
      // gets end-of-chain elements -- those with only text inside
      template.replace(/<(([^\s]+)([^>]+))>([\w\s\d]*)<\/\2>/gm, 
                       function(element, tag, attrstring, text) {
        // parse the attrs
        var attrs = attrstring.split(' ')
        var properties = {}
        for (var i = 0; i < attrs.length; i++) {
            var keyvalue = attrs[0].split('=')
            var key = keyvalue[0].toLowerCase().trim()
            var value = keyvalue[1]
            value = value ? value.toLowerCase().trim().replace(/"/g, '') : ''
            properties[key] = value
        }
        
        // set mapped attrs
        properties[x] = y 
        
        // set mapper text
        text = z
        
        // write output element
        attrlist = []
        for (var key in properties) {
          attrlist = key + '="' + properties[key] + '"'
        }
        attrstring = attrlist.join(' ')
        return '<' + tag + ' ' + attrstring + '>' + text + '</' + tag + '>'
      })

      return data.map( function (row) { 
        return template.replace(/ class="[a-z0-9\-]+">/, function (match) { 
          var cls = match.split(/\x22/)[1];
          var field = map[cls]; 
          if (!field) { 
            return match; 
          } 
          return (match + xmldefuse(row[field])); 
      }); 
    }).join(''); }; 
  }
}

var data = [
  {_id: 1, pkg: "sox", categ: "audio"},
  {_id: 2, pkg: "nano", categ: "editor"}
] 
var template = '<tr><th class="packagename"></th><td><a href="#" class="category"></a></td></tr>\n'
var map = { 
  packagename: "pkg", 
  category: "categ" 
} 

transplates.render(data, map, template);
console.log()
