"use strict";

/**
 * Expand variables and return the resulting object.
 * A  variable is  writtent like  this `%VarName%`.   And it  set like
 * this: `%VarName%: "blabla"`.  The value of a variable can be of any
 * type.   Variables defined  in the  value of  another variables  are
 * expanded only when the parent variable is expanded.
 *
 * @example:
 * {View SECTION
 *   %Button%: {tfw.view.button type: %Type% }
 *   %Type%: primary
 *   [
 *     {ARTICLE class: thm-bg3 %Button%}
 *     {ARTICLE class: thm-bgSL %Button%}
 *   ]}
 *
 * @description
 * It also possible to concatenate variables:
 * @example
 * view.attribs: {
 *   duration: {String}
 *   duration-selected: {Boolean true}
 *   level: {String}
 *   level-selected: {Boolean true}
 * }
 * %selected%: "-selected"
 * %Component%: {tfw.view.checkbox value: {Bind %type%+%selected%} content: {Bind %type%}}
 * [
 *   {%Component% %type%: duration}
 *   {%Component% %type%: level}
 * ]
 */
module.exports = function( def, moduleName, path ) {
  var context = { vars: {}, moduleName: moduleName, path: path };
  var preprocessedDef = process( context, def );
  return preprocessedDef;
};

var RX_VAR_NAME = /^%[a-zA-Z]+%$/;
var RX_VAR_NAME_CONCAT= /^%[a-zA-Z]+%(\+%[a-zA-Z]+%)+$/;

/**
 * Return a copy of `obj` after processing it.
 */
function process( ctx, obj ) {
  try {
    if( Array.isArray( obj ) ) return processArray( ctx, obj );
    switch( typeof obj ) {
    case "string": return processString( ctx, obj );
    case "object": return processObject( ctx, obj );
    default: return obj;
    }
  }
  catch( ex ) {
    fatal( ctx, ex );
  }
}


function processArray( ctx, arr ) {
  var preprocessedArray = arr.map( process.bind( null, ctx ) );
  return preprocessedArray.filter( x => x !== undefined );
}


function processString( ctx, str ) {
  try {
    if( RX_VAR_NAME.test( str ) ) {
      var value = ctx.vars[str];
      if( typeof value === 'undefined' )
        throw "Undefined variable " + str + "!";
      return value;
    }
    if( RX_VAR_NAME_CONCAT.test( str ) ) {
      var variables = str.split("+");
      return variables.map(varName => {
        var value = ctx.vars[varName];
        if( typeof value === 'undefined' )
          throw "Undefined variable " + str + "!";
        return value;
      }).join("");
    }
    else {
      return str;
    }
  }
  catch( ex ) {
    throw ex + "\n" + "processString( " + JSON.stringify( str ) + " )";
  }
}


function processObject( ctx, obj ) {
  if( typeof obj[0] === 'string' && RX_VAR_NAME.test( obj[0] ) )
    return processExtension( ctx, obj );
  var preprocessedObject = {};
  var key, val;
  // Parse variable settings first.
  for( key in obj ) {
    if( RX_VAR_NAME.test( key ) ) {
      ctx.vars[key] = obj[key];
    }
  }
  // Parse other attributes.
  for( key in obj ) {
    if( RX_VAR_NAME.test( key ) ) continue;
    val = process( ctx, obj[key] );
    preprocessedObject[key] = val;
  }
  return preprocessedObject;
}


/**
 * @example
 * {%Panel% %background%: "thm-bgP"}
 */
function processExtension( ctx, obj ) {
  var varName = obj[0];
  var baseObject = makeCopyOf(ctx.vars[varName]);
  if( typeof baseObject === 'undefined' )
    throw "Undefined variable for extension {" + varName + "}!";

  var key, val;
  // Parse variable settings first.
  for( key in obj ) {
    if( RX_VAR_NAME.test( key ) ) {
      ctx.vars[key] = obj[key];
    }
  }
  // Parse other attributes.
  for( key in obj ) {
    if( key == "0" ) continue;
    if( RX_VAR_NAME.test( key ) ) continue;
    val = process( ctx, obj[key] );
    baseObject[key] = val;
  }
  return processObject( ctx, baseObject );
}


function fatal( ctx, message ) {
  throw "Error while preprocessig module " + ctx.module + ":\n"
    + message + "\n"
    + "Defined variables at this point:\n"
    + Object.keys( ctx.vars )
    .map(k => "  " + k + ": " + JSON.stringify(ctx.vars[k]))
    .join("\n");
}


function makeCopyOf( obj ) {
  return JSON.parse( JSON.stringify( obj ) );
}
