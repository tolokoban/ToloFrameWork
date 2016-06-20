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
var Icon = require("wdg.icon");


function ShowHide( opts ) {
    var that = this;

    var icon = new Icon({content: "tri-right", size: "1.5em"});
    var label = $.tag('span', 'label');
    var head = $.div('head', [icon, label]);
    var body = $.div('body');
    var elem = $.elem( this, 'div', 'wdg-showhide', 'elevation-2', [head, body] );
    DB.propBoolean(this, 'value')(function(v) {
        if (v) $.addClass( elem, 'show' );
        else $.removeClass( elem, 'show' );
    });
    DB.propString(this, 'label')(function(v) {
        label.textContent = v;
    });
    DB.prop(this, 'content')(function(v) {
        $.clear( body );
        if (Array.isArray( v )) {
            v.forEach(function (itm) {
                $.add( body, itm );
            });
        } else if (typeof v !== 'undefined' && v !== null){
            $.add( body, v );
        }
    });
    opts = DB.extend( { value: true, label: '', content: null, visible: true, wide: true }, opts, this );

    $.on( head, function() {
        that.value = !that.value;
    });
}

/**
 * @class tfw.view.label
 * @param {string} value  - Text to display. If this  text starts with
 * `<html>`, it is parsed as HTML code.
 */
module.exports = ShowHide;
