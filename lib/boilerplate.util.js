"use strict";

/**
 * @param {array} lines - Array of lines of code.
 * @param {string="  "} indentIncrement - Indentation to add for every new bloc.
 * @param {string=""} currentIndent - Starting indentation.
 * @example
 * generate(["a", ["b", "c"], "d"], 2) ===
 *   "a" + "\n" +
 *   "  b" + "\n" +
 *   "  c" + "\n" +
 *   "d"
 */
exports.generateCode = generateCode;
/**
 * If `code`  is an array, prepend  `prefix` before the  first item (if  it is a string)  and append
 * `suffix` after last item (if it is a string).
 * @param {array} code
 * @param {string} prefix
 * @param {string=''} suffix
 */
exports.surroundCode = surroundCode;
/**
 * @param {string} msg - Error message.
 * @param {object=undefined} ex - Exception to bubble with.
 */
exports.throwError = throwError;
/**
 * Determine if  an object  is special or  not.  An  object is special  as soon as  it owns  the "0"
 * attribute.
 * @param {object} obj - Object to test.
 * @param  {string=undefined} expectedName  - If  defined,  test the  value  of `obj[0]`.  If it  is
 * different, return false.
 */
exports.isSpecial = isSpecial;
/**
 * Determnine if `name` is a valid Javascript identifier.
 * @param {string} name
 * @return {boolean}
 */
exports.isJavascriptIdentifier = isJavascriptIdentifier;
/**
 * @param {string} text - The text you want to capitalize.
 * @return {string} the `text` with the first letter uppercased.
 */
exports.cap = capitalize;
/**
 * @return the CamelCase version of the input string.
 */
exports.camel = camel;
/**
 * @return the capitalized CamelCase version of the input string.
 */
exports.camelCap = camelCap;
/**
 * Transform a Javascript value into an array of strings/arrays. This is made for code génération.
 * @return {array} Lines to be used with `generateCode`.
 */
exports.indentValue = indentValue;
/**
 * @param {string} attribName - Name of the atribute you want access.
 * @return {string} Util.att("foobar") === ".foobar"
 * Util.att("foo-bar") === '["foo-bar"]'
 */
exports.att = att;


function generateCode( lines, indentIncrement, currentIndent ) {
  if( typeof indentIncrement === 'undefined' ) indentIncrement = '  ';
  if( typeof currentIndent === 'undefined' ) currentIndent = '';

  return lines.map(function (line) {
    if( Array.isArray( line ) ) return generateCode( line, indentIncrement, currentIndent + indentIncrement );
    return currentIndent + line;
  }).join( "\n" );
}


function isSpecial( obj, expectedName ) {
  var type = typeof obj;
  if( type === 'string' || type !== 'object' || Array.isArray(obj) ) return false;
  if( !obj ) return false;
  var name = obj[0];

  if( typeof name !== 'string' ) return false;
  if( typeof expectedName === 'string' ) {
    return name.toLowerCase() === expectedName.toLowerCase();
  }
  return true;
}


function capitalize( text ) {
  if( typeof text !== 'string' ) return text;
  if( text.length === 0 ) return text;
  return text.charAt(0).toUpperCase() + text.substr( 1 ).toLowerCase();
}


function camel( name ) {
  return name.split('.').map(function( word, wordIdx ) {
    return word.split('-').map(function( piece, pieceIdx ) {
      if( wordIdx + pieceIdx === 0 ) return piece.toLowerCase();
      return capitalize( piece );
    }).join("");
  }).join("");
}


function camelCap( name ) {
  return capitalize( camel( name ) );
}


function indentValue( value ) {
  var type = typeof value;
  if( Array.isArray( value ) ) return indentValueArray( value );
}

function indentValueArray( arr ) {
  if( arr.length === 0 ) return "[]";
  var last = arr.length - 1;
  var out = [];
  arr.forEach(function (itm, idx) {
    if( idx === last ) {
      out.push( indentValue( itm ) );
    } else {

    }
  });

  if( arr.length === 1 ) {
    var firstItem = indentValue( arr[0] );
    if( !Array.isArray( firstItem ) ) return "[" + firstItem + "]";
  }

  out.push(']');
  return out;
}

function throwError( msg, ex ) {
  if( typeof ex === 'undefined' || !Array.isArray( ex.stack ) ) {
    throw { error: msg, stack: [] };
  }
  ex.stack.push( msg );
  throw ex;
}

var RX_JAVASCRIPT_IDENTIFIER = /^[$a-z_][$a-z_0-9]*$/i;
function isJavascriptIdentifier( name ) {
  return RX_JAVASCRIPT_IDENTIFIER.test( name );
}


function surroundCode( code, prefix, suffix ) {
  if( !Array.isArray( code ) ) return code;
  if( code.length < 1 ) return code;
  if( typeof suffix === 'undefined' ) suffix = '';
  var first = code[0], last = code[code.length - 1];
  if( code.length === 1 ) {
    if( !Array.isArray( first ) ) code[0] = prefix + first + suffix;
  }
  else {
    if( !Array.isArray( first ) ) code[0] = prefix + first;
    if( !Array.isArray( last ) ) code[code.length - 1] = last + suffix;
  }
  return code;
}


var RX_NAME = /^[a-z_$][a-z_$0-9]*$/gi;
function att( name ) {
  if( RX_NAME.test( name ) ) return "." + name;
  return "[" + JSON.stringify( name ) + "]";
}
