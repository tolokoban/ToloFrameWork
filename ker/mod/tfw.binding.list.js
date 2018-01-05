"use strict";

/*
fire( functionName, arguments, wave )
addListener( listener )
removeListener( listener )

link( list )
unlink( list )

get( index )
put( index, elem )

remove( elem )
removeAt( index )

mapInPlace( function(elem, index) )
*/

var Listeners = require("tfw.listeners");

var ID = "_tfw_binding_array_";
var COUNT = 1;

/**
 * A list is an observable array.
 *
 * Several lists can share the same internal array. In that case, when
 * one list modifies the array, all  lists will emit the same event as
 * it. Such lists are linked.
 */
var List = function( arg ) {
  readOnly( this, ID, COUNT++ );
  readOnly( this, "_listeners", new Listeners() );
  readOnly( this, "_links", [] );
  if( Array.isArray( arg ) ) {
    readOnly( this, "_array", arg );
  }
  else if( isList( arg ) ) {
    readOnly( this, "_array", arg._array );
    this.link( arg );
  }
  else {
    readOnly( this, "_array", [arg] );
  }
};

module.exports = List;
List.isList = isList;


List.prototype.fire = function( functionName, args, wave ) {
  var id = this[ID];
  if( !Array.isArray( wave ) ) wave = [id];
  else if( wave.indexOf( id ) === -1 ) wave.push( id );

  this._listeners.fire( functionName, args, wave );
  this._links.forEach(function (list) {
    if( wave.indexOf( list[ID] ) > -1 ) return;
    list.fire( functionName, args, wave );
  });
};

List.prototype.addListener = function( listener ) {
  this._listeners.add( listener );
};

List.prototype.removeListener = function( listener ) {
  this._listeners.remove( listener );
};


List.prototype.link = function( list ) {
  if( !isList( list ) ) {
    console.error( "Argument: ", list );
    throw Error("[tfw.binding.list.link] Argument must be a tfw.binding.list object!");
  }

  if( this._links.indexOf( list ) === -1 ) {
    this._links.push( list );
    list.link( this );
  }
};

List.prototype.unlink = function( list ) {
  var index = this._links.indexOf( list );
  if( index === -1 ) return;

  this._links.splice( index, 1 );
  list.unlink( this );
};

/**
 * The braket notation doesn't work with list.
 * This function
 */
List.prototype.get = function( index ) {
  return this._array[index];
};

List.prototype.put = function( index, newValue ) {
  var oldValue = this._array[index];
  if( oldValue === newValue ) return false;
  this._array[index] = newValue;
  this.fire( "put", {
    index: index,
    oldValue: oldValue,
    newValue: newValue
  });
  return true;
};

List.prototype.remove = function( elem ) {
  var index = this._array.indexOf( elem );
  if( index === -1 ) return false;
  this._array.splice( index, 1 );
  this.fire( "remove", { elem: elem, index: index } );
  return true;
};

List.prototype.removeAt = function( index ) {
  var elem = this._array[index];
  this._array.splice( index, 1 );
  this.fire( "remove", { elem: elem, index: index } );
  return true;
};

List.prototype.mapInPlace = function( func ) {
  var that = this;

  this._Array.forEach(function (itm, idx) {
    var newValue = func( itm );
    that.put( idx, newValue );
  });

  return this;
};

[
  "push", "pop", "shift", "unshift", "sort", "splice", "reverse"
]
  .forEach(function (funcName) {
    List.prototype[funcName] = function() {
      var args = Array.prototype.slice.call( arguments );
      var result = Array.prototype[funcName].apply(this._array, args);
      this.fire( funcName, args );
      return result;
    };
  });

/**
 * Functions that don't change the array.
 */
[
  "slice", "forEach", "filter", "map", "reduce",
  "indexOf", "lastIndexOf"
]
  .forEach(function (funcName) {
    List.prototype[funcName] = function() {
      var args = Array.prototype.slice.call( arguments );
      return Array.prototype[funcName].apply(this._array, args);
    };
  });

/**
 * Define the `length` property.
 */
Object.defineProperty( List.prototype, "length", {
  get: function() {
    return this._array.length;
  },
  set: function(v) {
    this._array.length = v;
    this.fire("length", v);
  },
  configurable: false,
  enumerable: true
});


function isList( candidate ) {
  return typeof candidate[ID] === 'number';
}

function readOnly( object, attrib, value ) {
  Object.defineProperty( object, attrib, {
    value: value, writable: false, configurable: false, enumerable: true
  });
}
