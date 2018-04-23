"use strict";

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Hammer = require("external.hammer");
var Converters = require('tfw.binding.converters');


exports.Tag = function(tagName, attribs) {
  tagName = tagName.trim().toLowerCase();

  var elem = tagName === 'svg' ? $.svgRoot() : newTag(tagName);
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
      case 'textcontent':
        defineAttribTextContent.call( that, elem );
        break;
      case 'innerhtml':
        defineAttribInnerHTML.call( that, elem );
        break;
      default:
        defineStandardAttrib.call( that, elem, attName );
      }
    });
  }
};


var SVG_TAGS = ["g", "rect", "circle", "line", "path", "defs"];
function newTag( name ) {
  if( SVG_TAGS.indexOf( name.toLowerCase() ) !== -1 ) return $.svg( name );
  return $.tag( name );
}


function defineAttribValue( elem ) {
  var that = this;

  var lastSettedValue = null;
  PM( this ).create('value', {
    get: function() { return lastSettedValue; },
    set: function(v) {
      elem.value = v;
      lastSettedValue = v;
    }
  });
  elem.addEventListener( "input", function(evt) {
    PM( that ).change( 'value', evt.target.value );
  }, false);
}

function defineAttribFocus( elem ) {
  var that = this;
  PM( this ).create('focus', {
    cast: Converters.get('boolean')(),
    delay: 1
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

function defineAttribTextContent( elem ) {
  ["textContent", "textcontent"].forEach(function (name) {
    PM( this ).create(name, {
      get: function() { return elem.textContent; },
      set: function(v) {
        elem.textContent = v;
      }
    });
  }, this);
}

function defineAttribInnerHTML( elem ) {
  ["innerHTML", "innerhtml"].forEach(function (name) {
    PM( this ).create(name, {
      get: function() { return elem.innerHTML; },
      set: function(v) {
        elem.innerHTML = v;
      }
    });
  }, this);
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
  if( !Array.isArray( newClasses ) ) newClasses = [newClasses];

  var oldClasses = this._applyer[id];
  if( Array.isArray( oldClasses ) ) {
    oldClasses.forEach( $.removeClass.bind( $, elem ) );
  }
  this._applyer[id] = newClasses;
  newClasses.forEach( $.addClass.bind( $, elem ) );
};


/**
 * Check if all needed function from code behind are defined.
 */
exports.ensureCodeBehind = function( code_behind ) {
  if( typeof code_behind === 'undefined' )
    throw "Missing mandatory global variable CODE_BEHIND!";

  var i, funcName;
  for( i = 1; i < arguments.length ; i++ ) {
    funcName = arguments[i];
    if( typeof code_behind[funcName] !== 'function' )
      throw "Expected CODE_BEHIND." + funcName + " to be a function!";
  }
};


var GESTURES = [
  "tap", "doubletap", "press",
  "pan", "panstart", "panmove", "panup", "pandown", "panleft", "panright", "panend", "pancancel",
  "swipe", "swipeleft", "swipteright", "swipetop", "swipebottom",
  "pinch", "pinchin", "pinchout", "pinchstart", "pinchmove", "pinchend", "pinchcancel",
  "rotate", "rotatestart", "rotatemove", "rotateend", "rotatecancel"
];

/**
 * @param {function} event.tap
 * @param {function} event.press
 * @param {function} event.pan
 * @param {function} event.swipe
 *
 * @example
 * ```
 * var View = require("tfw.view");
 * View.events( div, {
 *   "tap": function( evt ) {...},
 *   "press": function( evt ) {...}
 * });
 * ```
 */
exports.events = function( target, events ) {
  var elem = $(target);
  var gestures = {};
  var hasGestures = 0;

  Object.keys( events ).forEach(function (eventName) {
    eventName = eventName.toLowerCase();
    var eventSlot = events[eventName];
    if( GESTURES.indexOf( eventName ) > -1 ) {
      gestures[eventName] = eventSlot;
      hasGestures = true;
    } else {

      elem.addEventListener( eventName, eventSlot, false );
    }
  });

  if( hasGestures ) {
    var gestureHandler = new Hammer( elem );
    Object.keys( gestures ).forEach(function (eventName) {
      var eventSlot = events[eventName];
      gestureHandler.on( eventName, eventSlot );
    });
  }
};
