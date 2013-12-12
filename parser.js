function parse(html) {
  var braces = html.match(/<([^>]+)>/gm)
  var elements = {
    opened: [],
    closed: []
  }
  for (var i = 0; i < braces.length; i++) {
    var b = braces[i]
    var corp = b.slice(1, -1).split(' ')
    var = tag corp[0]
    var attrs = []
    for (var j = 0; j < corp.length; j++) {
      var keyvalue = corp[j].split('=')
      var key = keyvalue[0].toLowerCase().trim()
      var value = keyvalue[1]
      value = value ? value.toLowerCase().trim().replace(/"/g, '') : ''
      attrs.push({ key: value })
    }
  }
}
