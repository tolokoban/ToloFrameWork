"use strict";

/**
 * @export {parse}
 * @function parse
 * Parse a source code and extract all the special comments.
 * A comment is special if it starts with "/**" or "///".
 * Comments are returned as an array  of blocs. Comments which are not
 * separated by non-blank characters are in the same bloc.
 * @param {string} code - Source code to parse.
 * @return {array[array[array]]} Array  of blocs. A block  is an array
 * of lines. A  line is an array  with two items: the  line number and
 * the comment's line.
 */
module.exports = function( code ) {
  // 
  var mode = '';
  var size = code.length;
  var idx = 0;
  
  while ( idx < size ) {

  }
};
