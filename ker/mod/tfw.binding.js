"use strict";

var Converters = require("tfw.binding.converters");
var PropertyManager = require("tfw.binding.property-manager");


exports.defProps = function( obj, props, args ) {
  var propertyName, pm;
  for( propertyName in props ) {
    pm = exports.defProp( obj, propertyName, props[propertyName], args );
  }

  return pm;
};


/**
 * @param {function(v)} opts.cast
 */
exports.defProp = function( obj, name, opts, args ) {
  var pm = PropertyManager( obj );

  if( typeof opts === 'undefined' ) opts = {};
  if( typeof opts === 'function' ) opts = { set: opts };

  pm.converter( name, createConverter( opts.cast ) );
  pm.delay( name, opts.delay );
  if( typeof opts.set === 'function' ) {
    pm.on( name, opts.set );
  }

  Object.defineProperty( obj, name, {
    set: pm.change.bind( pm, name ),
    get: pm.get.bind( pm, name ),
    configurable: false,
    enumerable: true
  });

  // Intitial value.
  if( typeof args !== 'undefined' && typeof args[name] !== 'undefined') {
    opts.init = args[name];
  }
  if( typeof opts.init !== 'undefined' ) {
    window.setTimeout( pm.change.bind( pm, name, opts.init ) );
  }

  return pm;
};


function createConverter( arg ) {
  if( typeof arg === 'function' ) return arg;
  return undefined;
};
