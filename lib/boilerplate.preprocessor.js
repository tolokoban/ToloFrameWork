"use strict";

/**
 * Expand variables and return the resulting object.
 * A  variable is  writtent like  this `%VarName%`.   And it  set like
 * this: `%VarName%: "blabla"`.  The value of a variable can be of any
 * type.   Variables defined  in the  value of  another variables  are
 * expanded only when the parent variale is expanded.
 * @example:
 * {View SECTION
 *   %Button%: {tfw.view.button type: %Type% }
 *   %Type%: primary
 *   [
 *     {ARTICLE class: thm-bg3 %Button%}
 *     {ARTICLE class: thm-bgSL %Button%}
 *   ]}
 */
module.exports = function( def, moduleName, path ) {
  var context = { vars: {}, moduleName: moduleName, path: path };
  var preprocessedDef = process( context, def );
  return preprocessedDef;
};

var RX_VAR_NAME = /^%[a-zA-Z]+%$/;

/**
 * Return a copy of `obj` after processing it.
 */
function process( ctx, obj ) {
  if( Array.isArray( obj ) ) return processArray( ctx, obj );
  switch( typeof obj ) {
  case "string": return processString( ctx, obj );
  case "object": return processObject( ctx, obj );
  default: return obj;
  }
}


function processArray( ctx, arr ) {
  var preprocessedArray = arr.map( process.bind( null, ctx ) );
  return preprocessedArray.filter( x => x !== undefined );
}


function processString( ctx, str ) {
  if( !RX_VAR_NAME.test( str ) ) return str;
  var value = ctx.vars[str];
  if( typeof value === 'undefined' )
    fatal(ctx, "Undefined variable " + str + "!");
  return value;
}


function processObject( ctx, obj ) {
  var preprocessedObject = {};
  var key, val;
  for( key in obj ) {
    val = process( ctx, obj[key] );
    if( RX_VAR_NAME.test( key ) ) {
      ctx.vars[key] = val;
    } else {
      preprocessedObject[key] = val;
    }
  }
  return preprocessedObject;
}

function fatal( ctx, message ) {
  throw Error(
    "Error while preprocessig module " + ctx.module + ":\n"
      + message + "\n"
      + "Defined variables at this point: " + Object.keys( ctx.vars ).join(", ") );
}
