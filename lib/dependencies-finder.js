"use strict";

/**
 * Find any occurence of `require("...")` in the code and returns a list of dependencies.
 * @return {array} Array of strings found in `require("...")`.
 */
module.exports = function(code) {
  var result = { comments: [], requires: [] };
  var rx = /\/[\/*]|[_$a-z][_$a-z0-9]*|"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/gi;
  var rxString = /^"([^"\\]|\\.)*"|^'([^'\\]|\\.)*'/;
  var rxOpen = /^\s*\(\s*/;
  var rxClose = /^\s*\)\s*/;
  var len = code.length;
  var cursor = 0, pos;
  var match, item;
  var mode = 0;
  while( cursor < len ) {
    rx.lastIndex = cursor;
    match = rx.exec( code );
    if( !match ) break;
    cursor = rx.lastIndex;
    item = match[0];
    if( item == '//' ) {
      pos = code.indexOf("\n", cursor);
      cursor = pos + 1;
    }
    else if( item == '/*' ) {
      pos = code.indexOf("*/", cursor);
      result.comments.push( code.substr( cursor, pos - cursor - 1 ) );
      cursor = pos + 2;
    }
    else if( item == 'require' ) {
      match = rxOpen.exec( code.substr( cursor ) );
      if( !match ) continue;
      cursor += match[0].length;
      match = rxString.exec( code.substr( cursor ) );
      if( !match ) continue;
      item = match[0].substr( 1, match[0].length - 2 );
      cursor += match[0].length;
      match = rxClose.exec( code.substr( cursor ) );
      if( !match ) continue;
      result.requires.push( item );
    }
  }
  return result;
};
