"use strict";

var Parser = require("text-parser");

var RX_OPEN_PAR = /[^ \t\n\r(]/;

var GRAMMAR = {
    // Wait for comment, string, identifier or "require".
    start: function( stream, state ) {
        var c = stream.next();
        if (c == "'") return "skipString1";
        if (c == '"') return "skipString2";
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
        if (!stream.eatUntilRegex(RX_OPEN_PAR)) return "skipIdentifier";
        
        return undefined;
    }
};


/**
 * Find any occurence of `require("...")` in the code and returns a list of dependencies.
 * @return {array} Array of strings found in `require("...")`.
 */
module.exports = function(code) {
    var result = {
        requires: [],
        comments: []
    };
    return Parser({ text: code, grammar: GRAMMAR });
};
