"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");


exports.Tag = function(tagName, attribs) {
  tagName = tagName.trim().toLowerCase();
  
  var elem = tagName === 'svg' ? $.svgRoot() : $.tag(tagName);
  Object.defineProperty(this, '$', {
    value: elem, writable: false, enumerable: true, configurable: false
  });

  if( Array.isArray(attribs) ) {
    var that = this;
    attribs.forEach(function (attName) {
      if( attName.toLowerCase() === 'value' ) {
        PM( that ).create(attName, {
          get: function() { return elem.value; },
          set: function(v) { elem.value = v; }
        });
        elem.addEventListener( "input", function() {
          PM( that ).fire( attName );
        }, false);
      } else {
        PM( that ).create(attName, {
          get: function() {
            return elem.getAttribute( attName );
          },
          set: function(v) {
            elem.setAttribute( attName, v );
          }
        });
      }
    });
  }
};

/**
 * Apply a  set of CSS  classes after removing the  previously applied
 * one for the same `id`.
 */
exports.Tag.prototype.applyClass = function( newClasses, id ) {
  var elem = this.$;
  if( typeof id === 'undefined' ) id = 0;
  if( typeof this._applyer === 'undefined' ) this._applyer = {};

  var oldClasses = this._applyer[id];
  if( Array.isArray( oldClasses ) ) {
    oldClasses.forEach( $.removeClass.bind( $, elem ) );
  }
  this._applyer[id] = newClasses;
  newClasses.forEach( $.addClass.bind( $, elem ) );
};
