"use strict";


exports.generateCodeFrom = function( def, codeBehind, moduleName ) {
  var global = {};

  var attName, attValue;
  for( attName in def ) {
    if( attName == '0' ) continue;
    attValue = def[attName];
    global[attName] = parseAttributeValue( attValue );
  }

  return codeBehind + `
//--------------------------
// Module global variables.
var GLOBAL = ` + JSON.stringify( global, null, "  " );  
};


function parseAttributeValue( value ) {
  return value;
}
