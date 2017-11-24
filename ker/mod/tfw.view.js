"use strict";

var $ = require("dom");


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
  var args = Array.slice.call(arguments);
  args.unshift( this.$ );
  return $.add.apply($, args);
};

exports.Tag.prototype.clear = function() {
  var args = Array.slice.call(arguments);
  args.unshift( this.$ );
  return $.clear.apply($, args);
};
