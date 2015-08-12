"use strict";

var FS = require("fs");

function Buffer(filepath) {
  this._filepath = filepath;
  this._content = FS.readFileSync(filepath).toString();
  this._filesize = this._content.length;
  this._cursor = 0;
}

/**
 * @return Next available char, or null if the end of file is reached.
 */
Buffer.prototype.next = function() {
  if (this._cursor < this._filesize) {
    var c = this._content.charAt(this._cursor);
    this._cursor++;
    return c;
  }
  return null;
};


/**
 * @example
 * var HtmlLexer = require("html-lexer");
 * var instance = new HtmlLexer("toto.html");
 * @class HtmlLexer
 */
var HtmlLexer = function(filepath) {
  this._buffers = [];
  if (typeof filepath !== 'undefined') this.open(filepath);
};

/**
 * Open a new  file for parsing. You can call  this method several times
 * if you need to manage includes, for instance.
 * @return this
 */
HtmlLexer.prototype.open = function(filepath) {
  this._buffers.shift(new Buffer(filepath));
  return this;
};

/**
 * @return void
 */
HtmlLexer.prototype.next = function() {
  
};




HtmlLexer.create = function(filepath) {
  return new HtmlLexer(filepath);
};
module.exports = HtmlLexer;

