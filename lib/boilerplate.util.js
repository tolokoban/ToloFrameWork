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
