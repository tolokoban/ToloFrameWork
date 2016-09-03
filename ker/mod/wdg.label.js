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
    var elem = $.elem( this, 'span', 'wdg-label' );
    DB.prop(this, 'value')(function(v) {
        $.textOrHtml(elem, v);
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend( { value: '', visible: true, wide: false }, opts, this );
}

/**
 * @class tfw.view.label
 * @param {string} value  - Text to display. If this  text starts with
 * `<html>`, it is parsed as HTML code.
 */
module.exports = Label;
