"use strict";

var Parser = require("./text-parser");

var RX_OPEN_PAR = /[ \t\n\r]*\([ \t\n\r]*/g;
var RX_CLOSE_PAR = /[ \t\n\r]*\)[ \t\n\r]*/g;
var RX_STRING_SINGLE = /(\\'|[^'])*'/g;
var RX_STRING_DOUBLE = /(\\"|[^"])*"/g;
var RX_IDENTIFIER = /[a-z_$0-9\.]+/gi;
var RX_GARBAGE = /[\n\t\r+\-*\/=?&|<>()\[\],;:%]+/gi;

function unescapeString( text ) {
  var out = '';
  var escape = 0;
  var i, c;
  for (i = 1 ; i < text.length - 1 ; i++) {
    c = text.charAt(i);
    if (escape) {
      if (c == 'n') c = '\n';
      else if (c == 'r') c = '\r';
      else if (c == 't') c = '\t';
      out += c;
    } else {
      if (c == '\\') escape = 1;
      else out += c;
    }
  }
  return out;
}

var GRAMMAR = {
  // Wait for comment, string, identifier or "require".
  start: function( stream, state ) {
    var comment;
    var c = stream.eat("'", '"', "/", "require");
    if( !c ) {
      if( stream.eatRegex(RX_GARBAGE) ) return undefined;
      if( stream.eatRegex(RX_IDENTIFIER) ) return undefined;
      stream.next();
      return undefined;
    }
    if( c == "'" ) return "skipStringSingle";
    if( c == '"' ) return "skipStringDouble";
    if( c == '/' ) {
      c = stream.peek();
      if (c == '/') {
        stream.eatUntilChar("\n\r");
        stream.next();
      }
      else if (c == '*') {
        stream.next();
        comment = stream.eatUntilText("*/");
        if( comment.charAt(0) === '*' )
          state.comments.push( comment.substr( 1 ) );
        stream.eat("*/");
      }
      return undefined;
    }
    if( c == 'require' ) return "require";
    stream.next();
    return undefined;
  },
  //
  require: function( stream, state ) {
    if (!stream.eatRegex(RX_OPEN_PAR)) return "start";
    var name;
    if( stream.peek() === "'" ) {
      stream.next();
      name = "'" + stream.eatRegex(RX_STRING_SINGLE);
    }
    else if( stream.peek() === '"' ) {
      stream.next();
      name = '"' + stream.eatRegex(RX_STRING_DOUBLE);
    }
    if( !name || !stream.eatRegex(RX_CLOSE_PAR) ) return "start";
    name = unescapeString( name );
    if( name.substr(0, 7) == 'node://' ) return "start";
    if( state.requires.indexOf( name ) == -1 ) {
      if( state.requires.indexOf( name ) < 0 )
        state.requires.push( name );
    }
  },
  //
  skipStringSingle: function( stream, state ) {
    stream.eatRegex(RX_STRING_SINGLE);
    return "start";
  },
  //
  skipStringDouble: function( stream, state ) {
    stream.eatRegex(RX_STRING_DOUBLE);
    return "start";
  }
};


/**
 * Find any occurence of `require("...")` in the code and returns a list of dependencies.
 * @return {array} Array of strings found in `require("...")`.
 */
module.exports = function(code) {
  var state = {
    requires: [],
    comments: []
  };
  return Parser({ text: code, grammar: GRAMMAR, state: state });
};
