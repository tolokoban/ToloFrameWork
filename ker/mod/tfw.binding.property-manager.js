"use strict";

var Listeners = require("tfw.listeners");

/**
 * @module
 *
 */


function PropertyManager( container ) {
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

PropertyManager.prototype.fire = function( propertyName ) {
  var prop = this._p( propertyName );
  prop.listeners.fire( prop.val, propertyName, this._container, prop.tag );
  if( propertyName !== '*' ) {
    // You can listen  on all the properties of  a PropertyManager using
    // the special property name `*`.
    var propContainer = this._p['*'];
    propContainer.listeners.fire( prop.val, propertyName, this._container );
  }
};

PropertyManager.prototype.change = function( propertyName, value, tag ) {
  var prop = this._p( propertyName );
  // Tag is used to mark the origin  of a value. This is used in links
  // to prevent infinite retroaction between two linked properties.
  prop.tag = tag;
  var currentValue = prop.val;
  var converter = prop.converter;
  if( typeof converter === 'function' ) {
    value = converter( value );
  }
  if( value !== currentValue ) {
    prop.val = value;
    this.fire( propertyName );
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

/**
 * @class PropertyManager
 * @member on
 * @param {string} propertyName.
 * @param {function(val,name,container)} action  - Function to execute
 * when a property changed.
 */
PropertyManager.prototype.on = function( propertyName, action ) {
  var prop = this._p( propertyName );
  prop.listeners.add( action );
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
  prop.listeners.remove( action );
};


var ID = "__tfw.property-manager__";

/**
 * @export
 * @function
 * @param {object} container - Object which will hold properties.
 */
module.exports = function( container ) {
  if( typeof container === 'undefined' )
    throw Error("[tfw.binding.property-manager] Argument `container` is mandatory!");

  var pm = container[ID];
  if( !pm ) {
    pm = new PropertyManager( container );
    container[ID] = pm;
  }
  return pm;
};

// Private.
PropertyManager.prototype._p = function( propertyName ) {
  var p = this._props[propertyName];
  if( !p ) {
    p = {
      val: undefined,
      converter: undefined,
      listeners: new Listeners()
    };
    this._props[propertyName] = p;
  }
  return p;
};
