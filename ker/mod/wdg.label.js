/**
 * @module tfw.view.label
 *
 * @description
 * A simple label with a bindable property `label`.
 *
 * @example
 * var mod = require('tfw.view.label');
 */

var $ = require("dom");
var DB = require("tfw.data-binding");


function Label( opts ) {
    opts = DB.extend( { value: '' }, opts );
    var elem = $.elem( this, 'span', 'tfw-view-label', 'custom' );
    DB.prop(this, 'value')(function(v) {
        $.textOrHtml(elem, v);
    });
    this.value = opts.value;
}

/**
 * @class tfw.view.label
 * @param {string} value  - Text to display. If this  text starts with
 * `<html>`, it is parsed as HTML code.
 */
module.exports = Label;
