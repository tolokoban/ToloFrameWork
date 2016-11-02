"use strict";

var Parser = require("./text-parser");

var RX_OPEN_PAR = /[ \t\n\r]*\([ \t\n\r]*/g;
var RX_CLOSE_PAR = /[ \t\n\r]*\)[ \t\n\r]*/g;
var RX_STRING = /('(\\'|[^'])+')|("(\\"|[^"])+")/g;
var RX_IDENTIFIER = /[a-z_$0-9]/gi;

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
        var c = stream.next();
        if (c == "'" || c == '"') return "skipString";
        if (c == '/') {
            c = stream.peek();
            if (c == '/') {
                state.comments.push( stream.eatUntilChar("\n\r") );
            }
            else if (c == '*') {
                state.comments.push( stream.eatUntilText("*/") );
            }
            return undefined;
        }
        if (c == 'r') {
            if (!stream.eat('equire')) return "skipIdentifier";
            return "require";
        }
        return undefined;
    },
    //
    require: function( stream, state ) {
        if (!stream.eatRegex(RX_OPEN_PAR)) return "skipIdentifier";
        var name = stream.eatRegex(RX_STRING);
        if (!name) return "start";
        if (stream.eatRegex(RX_CLOSE_PAR)) {
            name = unescapeString( name );
            if (state.requires.indexOf( name ) == -1) {
                state.requires.push( name );
            }
        }
        return "start";
    },
    //
    skipString: function( stream, state ) {
        stream.eatRegex(RX_STRING);
        return "start";
    },
    //
    skipIdentifier: function( stream, state ) {
        stream.eatRegex(RX_IDENTIFIER);
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
