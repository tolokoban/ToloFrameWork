"use strict";

function f(v) {
  switch( typeof v ) {
  case "boolean":
    return v;
  case "number":
    return v != 0;
  case "string":
    v = v.trim().toLowerCase();
    if( v == 'true' || v == 'yes' ) return true;
    v = parseInt( v );
    if( !isNaN( v ) ) return v != 0;
    return false;
  default:
    return false;
  }
}
module.exports = function() { return f; };
