"use strict";

var CONVERTERS = {};

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
