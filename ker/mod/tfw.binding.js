"use strict";

var Converters = require("tfw.binding.converters");
var PropertyManager = require("tfw.binding.property-manager");

/**
 * @exports .isLinkable
 * Check if a property is a linkable property or not.
 */
exports.isLinkable = function( obj, propertyName ) {
  return PropertyManager.isLinkable( obj, propertyName );
};


/**
 * @exports .defProps
 * @function .defProps
 * Create a linkable property on an object.
 * @param {object} obj - Object on which to create a linkable property.
 * @param  {object} props  -  The attributes  names  are the  linkable
 * properties  names,  and  the  attributes values  are  the  linkable
 * properties options.
 * @see .defProp
 */
exports.defProps = function( obj, props, args ) {
  var propertyName, prop;
  for( propertyName in props ) {
    prop = props[propertyName];
    if( prop === null ) exports.defAction( obj, propertyName );
    else exports.defProp( obj, propertyName, prop, args );
  }
};


/**
 * @param {function(v)=undefined} opts.set - Function to call when the
 * value changed.
 * @param  {function(v)=undefined} opts.cast  -  Function  to call  to
 * convert the value we need to store.
 * @param {number=undefined} opts.delay - If defined, the value is set
 * not before `delay` milliseconds.
 * @param {any=undefined} opts.init - The initial value to set.
 * @param  {object=undefined}   initialValues  -  Initial   value  per
 * property name.
 */
exports.defProp = function( obj, name, opts, initialValues ) {
  var pm = PropertyManager( obj );

  if( typeof opts === 'undefined' ) opts = {};
  if( typeof opts === 'function' ) opts = { set: opts };
  if( Array.isArray( opts ) ) opts = { init: opts };
  if( typeof opts === 'string' ) opts = { 
    init: opts,
    cast: function(v) { return "" + v; }
  };
  if( typeof opts === 'number' ) opts = { 
    init: opts,
    cast: function(v) { return parseFloat( v ); }
  };
  if( typeof opts === 'boolean' ) opts = { 
    init: opts,
    cast: function(v) { return v ? true : false; }
  };
  if( typeof opts !== 'object' ) opts = { init: opts };

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
  if( typeof initialValues !== 'undefined' && typeof initialValues[name] !== 'undefined') {
    opts.init = initialValues[name];
  }
  if( typeof opts.init !== 'undefined' ) {
    pm.set( name, opts.init );
  }
};

function createConverter( arg ) {
  if( typeof arg === 'function' ) return arg;
  return undefined;
};
