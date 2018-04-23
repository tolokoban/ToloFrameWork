"use strict";

var $ = require("$");
var List = require("tfw.binding.list");
var Color = require("tfw.color");

var CONVERTERS = {
  boolean: booleanConverter,
  booleans: booleansConverter,
  color: colorConverter,
  multilang: multilangConverter,
  intl: intlConverter,
  not: notConverter,
  keys: keysConverter,
  sortedKeys: sortedKeysConverter,
  strings: stringsConverter,
  string: function(v) {
    if( v === null || v === undefined ) return "";
    if( typeof v === 'object' ) {
      if( Array.isArray( v ) ) {
        return JSON.stringify( v );
      } else {
        return intlConverter( v );
      }
    }
    return "" + v;
  },
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
  },
  array: arrayConverter,
  list: listConverter,
  unit: cssUnitConverter,
  units: cssUnitsConverter,
  length: lengthConverter,
  isEmpty: isEmptyConverter,
  isNotEmpty: isEmptyConverter,
  validator: validatorConverter
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



var RX_CSS_UNIT = /^(-?[.0-9]+)[ \n\r]*([a-z%]*)/;
function cssUnitConverter(v) {
  if( typeof v === 'number' ) return v + "px";
  v = ("" + v).trim().toLowerCase();
  if( v === 'auto' || v === 'inherit' ) return v;
  var m = RX_CSS_UNIT.exec( v );
  if( !m ) return "0";
  var scalar = parseFloat( m[1] );
  if( isNaN( scalar ) ) return "0";
  var unit = m[2];
  if( unit.length < 1 ) unit = "px";
  return scalar + unit;
}

var TRUE_FUNC = function() { return true; };

function validatorConverter( v ) {
  switch( typeof v ) {
  case 'string':
    if( v.trim().length === 0 ) return TRUE_FUNC;
    var rx = new RegExp( v );
    return function( text ) {
      return rx.test( text );
    };
  case 'function':
    return function( value ) {
      return booleansConverter( v( value ) );
    };
  }
  return TRUE_FUNC;
}

function cssUnitsConverter(v) {
  if( !Array.isArray( v ) ) return [];
  return v.map(cssUnitConverter);
}

function booleanConverter(v) {
  switch( typeof v ) {
  case 'string':
    return v.trim().toLowerCase() === 'true';
  case 'number':
    return v !== 0;
  default:
    return v ? true : false;
  }
}

function keysConverter(v) {
  if( !v ) return [];
  var keys = [];
  for( var key in v ) keys.push( key );
  return keys;
}

function sortedKeysConverter(v) {
  var keys = keysConverter(v);
  return keys.sort();
}

function booleansConverter(v) {
  if( !Array.isArray( v ) ) return [];
  return v.map(booleanConverter);
}

function colorConverter(v) {
  if( typeof v !== 'string' ) return '#000';  
  if( !Color.instance.parse( v ) ) return '#000';
  return Color.instance.stringify();
}

function notConverter(v) { return !booleanConverter( v ); }


function arrayConverter(v) {
  if( List.isList( v ) ) return v.slice();
  return Array.isArray( v ) ? v : [v];
}

function lengthConverter(v) {
  if( !v ) return 0;
  if( typeof v.length === 'number' ) {
    return v.length;
  }
  return 0;
}

function isEmptyConverter(v) {
  if( !v ) return true;
  if( typeof v === 'string' ) {
    return v.trim().length === 0;
  }
  if( typeof v.length === 'number' ) {
    return v.length === 0;
  }
  return false;
}

function isNotEmptyConverter(v) {
  return !isEmptyConverter(v);
}


function stringsConverter(v) {
  if( !Array.isArray( v ) ) return [];
  return v.map(function(v) { return "" + v; });
}


function multilangConverter(v) {
  if( !Array.isArray( v ) && typeof v !== 'object' ) {
    var def = {};
    def[$.lang()] = "" + v;
    return def;
  }
  return v;
}

function intlConverter(v) {
  if( typeof v === 'string' ) return v;
  if( typeof v === 'undefined' ) return "";
  if( v === null ) return "";
  var result = v[$.lang()];
  if( !result ) {
    for( var lang in v ) {
      result = v[lang];
      break;
    }
  }
  if( typeof result !== 'string' ) return "";
  return result;
}

function listConverter( v ) {
  if( List.isList( v ) ) return v;
  return new List( arrayConverter( v ) );
}
