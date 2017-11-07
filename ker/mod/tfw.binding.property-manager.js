"use strict";

var Event = require("tfw.event");


var ID = 0;


/**
 *
 */
function PropertyManager( container ) {
  Object.defineProperty( this, 'id', {
    value: ID++,
    writable: false,
    configurable: false,
    enumerable: true
  });
  this.name = this.id;
  this._props = {};
  this._container = container;
}

/**
 * @class PropertyManager
 * @member set
 * Set the inner value of a property without fireing any event.
 * @param {string} propertyName.
 * @param {any} value.
 */
PropertyManager.prototype.set = function( propertyName, value ) {
  this._p( propertyName ).val = value;
};

/**
 * @class PropertyManager
 * @member get
 * @param {string} propertyName.
 * @return {any} Inner value of the property.
 *
 */
PropertyManager.prototype.get = function( propertyName ) {
  return this._p( propertyName ).val;
};

PropertyManager.prototype.propertyId = function( propertyName ) {
  return this._p( propertyName ).id;
};

PropertyManager.prototype.fire = function( propertyName, wave ) {
  var prop = this._p( propertyName );
  prop.event.fire( prop.val, propertyName, this._container, wave );
  if( propertyName !== '*' ) {
    // You can listen  on all the properties of  a PropertyManager using
    // the special property name `*`.
    var propContainer = this._p( '*' );
    propContainer.event.fire( prop.val, propertyName, this._container, wave );
  }
};

PropertyManager.prototype.change = function( propertyName, value, wave ) {
  var prop = this._p( propertyName );

  var currentValue = prop.val;
  var converter = prop.converter;
  if( typeof converter === 'function' ) {
    value = converter( value );
  }
  if( value !== currentValue ) {
    prop.val = value;
    var that = this;
    exec(prop, function() {
      // Fire change event.
      that.fire( propertyName, wave );
    });
  }
};

/**
 * @class PropertyManager
 * @member converter
 * @param {string} propertyName.
 * @param {function=undefined} converter -  Converter is assigned only
 * if it is a function.
 * @return {function} Current converter.
 */
PropertyManager.prototype.converter = function( propertyName, converter ) {
  var prop = this._p( propertyName );
  if( typeof converter === 'function' ) {
    prop.converter = converter;
  }
  else if( typeof converter !== 'undefined' ) {
    throw Error(
      "[tfw.binding.property-manager::converter] "
        + "`converter` must be of type function or undefined!"
    );
  }
  return prop.converter;
};

PropertyManager.prototype.delay = function( propertyName, delay ) {
  var prop = this._p( propertyName );
  delay = parseFloat( delay );
  if( isNaN( delay ) ) return prop.delay;
  prop.delay = delay;
};

/**
 * @class PropertyManager
 * @member on
 * @param {string} propertyName.
 * @param {function(val,name,container)} action  - Function to execute
 * when a property changed.
 */
PropertyManager.prototype.on = function( propertyName, action ) {
  var prop = this._p( propertyName );
  prop.event.add( action );
};

/**
 * @class PropertyManager
 * @member off
 * @param {string} propertyName.
 * @param {function(val,name,container)} action  - Function to execute
 * when a property changed.
 */
PropertyManager.prototype.off = function( propertyName, action ) {
  var prop = this._p( propertyName );
  prop.event.remove( action );
};


var SYMBOL = "__tfw.property-manager__";

/**
 * @export
 * @function
 * @param {object} container - Object which will hold properties.
 */
module.exports = function( container ) {
  if( typeof container === 'undefined' )
    fail("Argument `container` is mandatory!");

  var pm = container[SYMBOL];
  if( !pm ) {
    pm = new PropertyManager( container );
    container[SYMBOL] = pm;
  }
  return pm;
};

/**
 * @export .isLinkable
 * Look if an object has a property manager assigned to it.
 */
module.exports.isLinkable = function( obj, propertyName ) {
  if( obj[SYMBOL] === undefined ) return false;
  if( typeof propertyName !== 'string' ) return true;
  return obj[SYMBOL]._props[propertyName] !== undefined;
};


// Private.
PropertyManager.prototype._p = function( propertyName ) {
  if( typeof propertyName !== 'string' ) fail("propertyName must be a string!");
  var p = this._props[propertyName];
  if( !p ) {
    p = {
      val: undefined,
      event: new Event(),
      filter: undefined,
      converter: undefined,
      delay: 0,
      action: null,
      timeout: 0
    };
    this._props[propertyName] = p;
  }
  return p;
};


/**
 * Most  of  the  time,  `action` is  called  immediatly  without  any
 * argument. But  you can configure  your property with a  `delay`. If
 * you do so, the action is only called after this `delay`(in ms). The
 * `action`can be lost  if another call to `exec()`  occurs before the
 * end of the `delay` and the `delay` is reset.
 */
function exec( prop, action ) {
  if( !prop.delay ) action();
  else {
    clearTimeout( prop.timeout );
    prop.timeout = setTimeout( action, prop.delay );
  }
};


function fail( msg, source ) {
  if( typeof source === 'undefined' ) {
    source = "";
  } else {
    source = "::" + source;
  }
  throw Error("[tfw.binding.property-manager" + source + "] " + msg);
}
