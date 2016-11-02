"use strict";

/**
 * @param {string} text - Text to parse.
 * @param {number} begin - Where the parsing begins (default is 0). 
 * @param {number} end - Upper bound of text to be parsed (default is `text.length`). If `end == n`, the parsing will stop at char `n - 1`.
 */
var TextParser = function( text, begin, end ) {
    if( typeof text === 'undefined' ) text = '';
    if( typeof begin === 'undefined' ) begin = 0;
    if( typeof end === 'undefined' ) end = text.length;

    this._text = text;
    this._cursor = begin;
    this._end = end;
};


/**
 * End of stream.
 * @return `true` is there is at least one character left in the stream.
 */
TextParser.prototype.eos = function() {
    return this._cursor >= this._end;
};

/**
 * @return Next character without advancing in the stream, or `null` if at end of stream.
 */
TextParser.prototype.peek = function() {
    if (this.eos()) return null;
    return this._text.charAt( this._cursor );
};

/**
 * @return Next character and advance in the stream, or `null` if at end of stream.
 */
TextParser.prototype.next = function() {
    if (this.eos()) return null;
    return this._text.charAt( this._cursor++ );
};

/**
 * If the current text starts with one of the arguments, advance the stream and return that text.
 * 
 * @return `null` at end of stream or if no text has been found.
 */
TextParser.prototype.eat = function() {
    if (!this.eos()) {
        var i, arg;
        for (i = 0 ; i < arguments.length ; i++) {
            arg = arguments[i];
            if (this._text.substr( this._cursor, arg.length ) == arg) {
                this._cursor += arg.length;
                return arg;
            }
        }
    }
    return null;
};

/**
 * Return the result if `regexp` matches the text.
 * 
 * @param {Regex} regex - Regular expression to match.
 * @param {number} group - Group index to return (default is 0).
 * @return void
 */
TextParser.prototype.eatRegex = function(regex, group) {
    if (!regex.global) throw Error("[text-parser:eatRegex] Regular expression MUST be global! "
                                  + "Please add option `g` at the end of /" + regex.source + "/.");
    if( typeof group !== 'number' ) group = 0;
    if (this.eos()) return null;
    regex.lastIndex = this._cursor;
    var matcher = regex.exec( this._text );
    if (!matcher) return null;
    // Match must be done at current position.
    if (matcher.index != this._cursor) return null;
    this._cursor += matcher[0].length;
    return matcher[group];
};

/**
 * Advance the stream until we reach a character in `chars`.
 * 
 * @return `null` at end of stream, or the found string.
 */
TextParser.prototype.eatUntilChar = function( chars ) {
    if (this.eos()) return null;
    var begin = this._cursor;
    while (this._cursor < this._end) {
        if (chars.indexOf( this._text.charAt( this._cursor ) ) != -1 ) {
            break;
        }
        this._cursor++;
    }
    return this._text.substr( begin, this._cursor - begin );
};

/**
 * Advance the stream until we reach `text`.
 * 
 * @return `null` at end of stream, or the found string.
 */
TextParser.prototype.eatUntilText = function( text ) {
    if (this.eos()) return null;
    var begin = this._cursor;
    var len = text.length;
    while (this._cursor < this._end) {
        if (this._text.substr( this._cursor, len ) == text) break;
        this._cursor++;
    }
    return this._text.substr( begin, this._cursor - begin );
};

/**
 * Advance the stream until the `regex` matches.
 * 
 * @return `null` at end of stream, or the found string.
 */
TextParser.prototype.eatUntilRegex = function( regex ) {
    if (this.eos()) return null;
    if (!regex.global) throw Error("[text-parser:eatRegex] Regular expression MUST be global! "
                                  + "Please add option `g` at the end of /" + regex.source + "/.");
    var begin = this._cursor;
    var matcher;
    while (this._cursor < this._end) {
        regex.lastIndex = this._cursor;
        matcher = regex.exec( this._text );
        if (matcher) break;
        this._cursor++;
    }
    return this._text.substr( begin, this._cursor - begin );
};



module.exports = function( args ) {
    if( typeof args !== 'object' || args === null ) {
        throw Error("[text-parser] Bad argument! Expecting {text, grammar, state, begin, end}.");
    }

    var grammar = args.grammar;
    if( typeof grammar === 'undefined' ) {
        throw Error("[text-parser] Missing mandatory argument `grammar`!");
    }
    var step = '';
    // Take the first key as starting step.
    for( step in grammar ) break;

    if( typeof args.state === 'undefined' ) args.state = {};
    var stream = new TextParser( args.text, args.begin, args.end );
    var nextStep;
    var stepFunc = args.grammar[step];
    while (!stream.eos()) {
        nextStep = stepFunc( stream, args.state );
        if (nextStep === null) break;
        if (typeof nextStep === 'string') {
            stepFunc = args.grammar[nextStep];
            if (typeof stepFunc !== 'function') {
                throw Error("[text-parser] Invalid next step in step `"
                            + step + "`: `" + nextStep + "`!");
            }
            step = stepFunc;
        }
    }
    
    return args.state;
};
