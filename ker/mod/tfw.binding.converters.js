"use strict";

var CONVERTERS = {
  boolean: function() {
    return function(v) {
      switch( typeof v ) {
      case 'string':
        return v.trim().toLowerCase() === 'true';
      case 'number':
        return v !== 0;
      default:
        return v ? true : false;
      }
    };
  },
  not: function() {
    return function(v) {
      switch( typeof v ) {
      case 'string':
        return v.trim().toLowerCase() !== 'true';
      case 'number':
        return v === 0;
      default:
        return v ? false : true;
      }
    };
  },
  string: function() { return function(v) { return "" + v; }; },
  integer: function( valueForNaN ) {
    if( typeof valueForNaN === 'number' ) {
      return function(v) {
        var n = parseInt(v);
        if( isNaN( n ) ) return valueForNaN;
        return n;
      };
    } else {
      return parseInt;
    }
  },
  float: function( valueForNaN ) {
    if( typeof valueForNaN === 'number' ) {
      return function(v) {
        var n = parseFloat(v);
        if( isNaN( n ) ) return valueForNaN;
        return n;
      };
    } else {
      return parseFloat;
    }
  },
  enum: function( list ) {
    var caseInsensitiveList = list.map(function(x) { return x.toLowerCase(); });
    return function(v) {
      var idx = Math.max( 0, caseInsensitiveList.indexOf( ("" + v).toLowerCase() ) );
      return list[idx];
    };
  }
};

exports.get = function( converterName ) {
  return CONVERTERS[converterName];
};


exports.set = function( converterName, converter ) {
  if( typeof converter === 'function' ) {
    CONVERTERS[converterName] = converter;
  } else {
    delete CONVERTERS[converterName];
  }
};
