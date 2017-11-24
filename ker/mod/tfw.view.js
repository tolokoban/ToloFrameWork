"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");


exports.Tag = function(tagName, attribs) {
  var elem = document.createElement(tagName);
  Object.defineProperty(this, '$', {
    value: elem, writable: false, enumerable: true, configurable: false
  });

  if( Array.isArray(attribs) ) {
    var that = this;
    attribs.forEach(function (attName) {
      PM( that ).create(attName, {
        get: function() {
          return elem.getAttribute( attName );
        },
        set: function(v) {
          elem.setAttribute( attName, v );
        }
      });
    });
  }
};
