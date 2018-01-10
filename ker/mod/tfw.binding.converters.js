"use strict";

var $ = require("$");
var List = require("tfw.binding.list");

var CONVERTERS = {
  boolean: function() { return booleanConverter; },
  booleans: function() { return booleansConverter; },
  multilang: function() { return multilangConverter; },
  not: function() { return notConverter; },
  strings: function() { return stringsConverter; },
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
  },
  array: function() { return arrayConverter; },
  list: function() { return listConverter; },
  unit: function() { return cssUnitConverter; },
  units: function() { return cssUnitsConverter; },
  isEmpty: function() { return isEmptyConverter; },
  isNotEmpty: function() { return isEmptyConverter; }
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

function booleansConverter(v) {
  if( !Array.isArray( v ) ) return [];
  return v.map(booleanConverter);
}


function notConverter(v) { return !booleanConverter( v ); }


function arrayConverter(v) {
  return Array.isArray( v ) ? v : [v];
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


function listConverter( v ) {
  return new List( v );
}
