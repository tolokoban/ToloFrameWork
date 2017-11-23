"use strict";


exports.Tag = function(tagName, attribs) {
  var elem = document.createElement(tagName);
  Object.defineProperty(this, '$', {
    value: elem, writable: false, enumerable: true, configurable: false
  });

  if( Array.isArray(attribs) ) {
    var that = this;
    attribs.forEach(function (attName) {
      
    });
  }
};

exports.Tag.prototype.add = function() {
  var elem = this.$;
  Array.slice.call(arguments).forEach(function(child, idx) {
    elem.appendChild( child.$ );
  });
};
