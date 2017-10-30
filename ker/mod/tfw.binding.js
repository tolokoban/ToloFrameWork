"use strict";

var Converters = require("tfw.binding.converters");
var PropertyManager = require("tfw.binding.property-manager");


exports.defProps = function( obj, props, args ) {
  var propertyName, pm, prop;
  for( propertyName in props ) {
    prop = props[propertyName];
    if( prop === null ) pm = exports.defAction( obj, propertyName );
    else pm = exports.defProp( obj, propertyName, prop, args );
  }

  return pm;
};


/**
 * @param {function(v)=undefined} opts.set - Function to call when the
 * value changed.
 * @param  {function(v)=undefined} opts.cast  -  Function  to call  to
 * convert the value we need to store.
 * @param {number=undefined} opts.delay - If defined, the value is set
 * not before `delay` milliseconds.
 * @param {any=undefined} opts.init - The intial value to set.
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

/**
 * This is a special property which emit a change event as soon as any
 * value is set to  it, even if this valule has  already been set just
 * before. Moreover, the value of this attribute is always its name.
 * This is used for action properties in buttons, for instance.
 */
exports.defAction = function( obj, name ) {
  var pm = PropertyManager( obj );

  Object.defineProperty( obj, name, {
    set: function(v) { 
      pm.set( name, name ); 
      pm.fire( name ); 
    },
    get: function() { return name; },
    configurable: false,
    enumerable: true
  });

  return pm;
};


function createConverter( arg ) {
  if( typeof arg === 'function' ) return arg;
  return undefined;
};
