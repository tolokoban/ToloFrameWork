"use strict";

var Event = require("tfw.event");
var List = require("tfw.binding.list");

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
  this.create( propertyName ).set( value );
};

/**
 * @class PropertyManager
 * @member get
 * @param {string} propertyName.
 * @return {any} Inner value of the property.
 *
 */
PropertyManager.prototype.get = function( propertyName ) {
  return this.create( propertyName ).get();
};

PropertyManager.prototype.propertyId = function( propertyName ) {
  return this.create( propertyName ).id;
};

PropertyManager.prototype.fire = function( propertyName, wave ) {
  var prop = this.create( propertyName );
  prop.event.fire( prop.get(), propertyName, this._container, wave );
  if( propertyName !== '*' ) {
    // You can listen  on all the properties of  a PropertyManager using
    // the special property name `*`.
    var propContainer = this.create( '*' );
    propContainer.event.fire( this._container, "*", this._container, wave );
  }
};

PropertyManager.prototype.change = function( propertyName, value, wave ) {
  if( typeof wave === 'undefined' ) wave = [];

  var prop = this.create( propertyName );

  var converter = prop.converter;
  if( typeof converter === 'function' ) {
    value = converter( value );
  }

  if( propertyName === '*' ) {
    exec(prop, applyAttributesToTarget.bind( this, value, this._container ) );
  } else {
    var currentValue = prop.get();
    if( prop.alwaysFired || value !== currentValue ) {
      prop.set( value );
      var that = this;
      exec(prop, function() {
        // Fire change event.
        that.fire( propertyName, wave );
      });

      manageListListener( propertyName, prop, currentValue, prop.get() );
    }
  }
};

/**
 * If the property  `foobar` is a List, the  pseudo property `foobar*`
 * can fire change event if the list has changed.
 * When the property `foobar` is assigned a new value, we must release
 * the last event listeners and attach new ones.
 */
function manageListListener( propertyName, prop, oldValue, newValue ) {
  if( List.isList( oldValue ) ) {
    oldValue.removeListener( prop.contentListener );
  }
  if( List.isList( newValue ) ) {
    newValue.addListener( prop.contentListener );
  }
}

/**
 * @class PropertyManager
 * @member converter
 * @param {string} propertyName.
 * @param {function=undefined} converter -  Converter is assigned only
 * if it is a function.
 * @return {function} Current converter.
 */
PropertyManager.prototype.converter = function( propertyName, converter ) {
  var prop = this.create( propertyName );
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
  var prop = this.create( propertyName );
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
  var prop = this.create( propertyName );
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
  var prop = this.create( propertyName );
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

module.exports.getAllAttributesNames = function( obj ) {
  if( obj[SYMBOL] === undefined ) return [];
  return Object.keys( obj[SYMBOL]._props );
};


/**
 * @export .create
 * Create an new linkable property.
 * @param {string} propertyName - Name of the property.
 * @param {any} options.init - Initial value. Won't fire any change notification.
 * @param {function=undefined} options.get - Special getter.
 * @param {function=undefined} options.set - Special setter.
 * @param {function=undefined}  options.cast - Conversion to  apply to
 * the value before setting it.
 */
PropertyManager.prototype.create = function( propertyName, options ) {
  var that = this;
  if( typeof options === 'undefined' ) options = {};
  if( typeof propertyName !== 'string' ) fail("propertyName must be a string!");
  var p = this._props[propertyName] || createNewProperty.call( this, propertyName, options );
  return p;
};

/**
 * Copy all the attributes of `source` into `target`.
 */
function applyAttributesToTarget( source, target ) {
  var attName, attValue;
  for( attName in source ) {
    if( module.exports.isLinkable( target, attName ) ) {
      attValue = source[attName];
      target[attName] = attValue;
    }
  }
}

function createNewProperty( propertyName, options ) {
  var that = this;

  if( propertyName !== '*' ) {
    Object.defineProperty(this._container, propertyName, {
      get: that.get.bind( that, propertyName ),
      set: that.change.bind( that, propertyName ),
      enumerable: true, configurable: false
    });
  }
  var value = undefined;
  var setter;
  if( typeof options.cast === 'function' ) {
    if( typeof options.set === 'function' ) {
      setter = function(v) {
        options.set( options.cast( v, that ) );
      };
    } else {
      setter = function(v) { value = options.cast( v, that ); };
    }
  } else {
    setter = typeof options.set === 'function' ? options.set : function(v) { value = v; };
  }
  var prop = {
    event: new Event(),
    filter: functionOrUndefined( options.filter ),
    converter: functionOrUndefined( options.converter ),
    delay: castPositiveInteger( options.delay ),
    action: null,
    alwaysFired: options.alwaysFired ? true : false,
    timeout: 0,
    contentListener: PropertyManager.prototype.fire.bind( this, propertyName + "*" ),
    get: typeof options.get === 'function' ? options.get : function() { return value; },
    set: setter
  };
  this._props[propertyName] = prop;
  if( typeof options.init !== 'undefined' ) {
    this.set( propertyName, options.init );
  }
  return prop;
}

/**
 * This is a special property which emit a change event as soon as any
 * value is set to  it, even if this valule has  already been set just
 * before. Moreover, the value of this attribute is always its name.
 * This is used for action properties in buttons, for instance.
 */
PropertyManager.prototype.createAction = function( propertyName, options ) {
  if( typeof options === 'undefined' ) options = {};
  options.alwaysFired = true;
  return this.create( propertyName, options );
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

function castPositiveInteger( v ) {
  if( typeof v !== 'number' ) return 0;
  if( isNaN( v ) ) return 0;
  return Math.max( 0, Math.floor( v ) );
}

function functionOrUndefined( f ) {
  if( typeof f === 'function' ) return f;
  return undefined;
}
