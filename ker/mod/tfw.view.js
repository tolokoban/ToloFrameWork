"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Converters = require('tfw.binding.converters');

exports.Tag = function(tagName, attribs) {
  tagName = tagName.trim().toLowerCase();

  var elem = tagName === 'svg' ? $.svgRoot() : $.tag(tagName);
  Object.defineProperty(this, '$', {
    value: elem, writable: false, enumerable: true, configurable: false
  });

  if( Array.isArray(attribs) ) {
    var that = this;
    attribs.forEach(function (attName) {
      switch( attName.toLowerCase() ) {
      case 'value':
        defineAttribValue.call( that, elem );
        break;
      case 'focus':
        defineAttribFocus.call( that, elem );
        break;
      default:
        defineStandardAttrib.call( that, elem, attName );
      }
    });
  }
};


function defineAttribValue( elem ) {
  PM( this ).create('value', {
    get: function() { return elem.value; },
    set: function(v) { elem.value = v; }
  });
  elem.addEventListener( "input", function() {
    PM( this ).fire( 'value' );
  }, false);
}

function defineAttribFocus( elem ) {
  var that = this;
  PM( this ).create('focus', {
    cast: Converters.get('boolean')()
  });
  PM( this ).on( "focus", function(v) {
    if( v ) elem.focus();
    else elem.blur();
  });
  elem.addEventListener( "focus", function() {
    that.focus = true; }, false);
  elem.addEventListener( "blur", function() {
    that.focus = false; }, false);
}

function defineStandardAttrib( elem, attName ) {
  PM( this ).create(attName, {
    get: function() {
      return elem.getAttribute( attName );
    },
    set: function(v) {
      elem.setAttribute( attName, v );
    }
  });
}

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
