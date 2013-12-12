// libxmljs-easy
// =============
//
// libxmljs-easy is a Node.js module which simplifies XML traversing,
// similar to [E4X](http://en.wikipedia.org/wiki/ECMAScript_for_XML).
//
// Installation
// ------------
//
//      npm install libxmljs-easy
//

var libxml = require("libxmljs");
var util = require("util");
var Proxy = require("node-proxy");
var handlerMaker = require("./handler-maker");

// Usage
// -----
//
// Use module
//
//      var easy = require("libxmljs-easy");
//
// Parse XML
//
//      var xml = easy.parse('<books><book name="Lord of the Rings">' +
//                              '<author name="J. R. R. Tolkien" />' +
//                              '<language>English</language>' +
//                           '</book></books>');
//
// Select elements from collections explicitly
//
//      assert.equal(xml.book[0].$name, "Lord of the Rings");
//      assert.equal(xml.book[0].author[0].$name, "J. R. R. Tolkien");
//
// Use shorthands (works well for case when there is single child element with given name)
//
//      assert.equal(xml.book.$name, "Lord of the Rings");
//      assert.equal(xml.book.author.$name, "J. R. R. Tolkien");
//
// Basically the idea is that you construct a path from tag names,
// which can optionally end with attribute name prefixed with "$".
//
// When index is ommited – the array of elements is matched.
// When attribute is accessed on such array, its value is concatenated string
// of attribute values for each of elements in the array.
//
// There is also original DOM element available as "$" property
// of individual converted elements.
//
//      assert.equal(xml.book.language[0].$.text(), "English");
//
//
exports.parse = function(str) {
    var xml = libxml.parseXmlString(str);

    return convertElement(xml.root());
}

function createProxy(converted, attrGetter, elemGetter, attrSetter, elemSetter) {
    // Create default handler for object proxy
    var handler = handlerMaker(converted);

    // Getter for proxy properties
    handler.get = function(target, name) {
        if (typeof converted[name] != "undefined") {
            return converted[name];
        }

        if (name == "$") {
            return undefined;
        }

        if (name[0] == "$") {
            var attrName = name.slice(1);
            return attrGetter.call(target, attrName);
        }

        return enhanceResults(elemGetter.call(target, name));
    };

    // Setter for proxy properties
    handler.set = function(target, name, value) {
        if (typeof converted[name] != "undefined") {
            // Default forwarding
            converted[name] = value;
        } else if (name[0] == "$") {
            // Set attribute
            var attrName = name.slice(1);
            attrSetter.call(target, attrName, value);
        } else {
            // Child elements
            elemSetter.call(target, name, value);
        }
    };

    return Proxy.create(handler);
}

function enhanceResults(results) {
    return createProxy(results,
        function(attrName) {
            return results.map(function(it) {
                return it["$" + attrName];
            }).join("");
        },
        function(name) {
            return Array.prototype.concat.apply([],
                results.map(function(it) {
                    return it[name];
                })
            );
        },
        function(attrName, value) {
            results.forEach(function(it) {
                it["$" + attrName] = value;
            });
        },
        function(name, value) {
            results.forEach(function(it) {
                it[name] = value;
            });
        }
    );
}

// Convert single DOM element into "easy" representation
function convertElement(elem) {
    // Convert child elements recursively
    var converted = elem.childNodes().map(function(it) {
        if (it instanceof libxml.Element) {
            return convertElement(it);
        }

        return it;
    });

    // Save DOM element object
    Object.defineProperty(converted, "$", {value: elem});

    // Create proxy with helper methods
    return createProxy(converted,
        function(attrName) {
            return elem.attr(attrName) ? elem.attr(attrName).value() : "";
        },
        function(name) {
            return converted.filter(function(it) {
                return it.$.name() == name;
            });
        },
        function(attrName, value) {
            elem.attr(attrName, value);
        },
        function(name, value) {
            // Child elements
            if (value != null && value.constructor == String) {
                var matchingElements = this[name];
                if (matchingElements.length > 0) {
                    // Set text of existing elements
                    matchingElements.forEach(function(it) {
                        it.$.text(value);
                    });
                } else {
                    // Create new element
                    converted.push(convertElement(elem.node(name, value)));
                }
            } else {
                // Remove old elements
                for (var i = 0; i < converted.length;) {
                    if (converted[i].$.name() == name) {
                        converted[i].$.remove();
                        converted.splice(i, 1);
                    } else {
                        i++;
                    }
                }

                if (value == null) {
                    return;
                }

                function addChildElement(obj) {
                    if (obj.$) {
                        converted.$.addChild(obj.$);
                        converted.push(convertElement(obj.$));
                    } else {
                        // Create new element
                        var child = convertElement(elem.node(name));
                        converted.push(child);
                        // Create child elements
                        Object.keys(obj).forEach(function(it) {
                            child[it] = obj[it];
                        });
                    }
                }

                if (!value.$ && value.constructor == Array) {
                    value.forEach(function(it) {
                        addChildElement(it);
                    });
                } else {
                    addChildElement(value);
                }
            }
        }
    );
}
