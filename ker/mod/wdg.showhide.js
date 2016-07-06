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


function Showhide( opts ) {
    var that = this;

    var icon = new Icon({content: "tri-right", size: "1.5em"});
    var label = $.tag('span', 'label');
    var head = $.div('head', [icon, label]);
    var body = $.div('body');
    var elem = $.elem( this, 'div', 'wdg-showhide', 'theme-elevation-2', [head, body] );
    DB.propBoolean(this, 'value')(function(v) {
        if (v) $.addClass( elem, 'show' );
        else $.removeClass( elem, 'show' );
    });
    DB.propString(this, 'label')(function(v) {
        label.textContent = v;
    });
    DB.propUnit(this, 'maxHeight')(function(v) {
        if (typeof v !== 'string') {
            // The size of the widget is determined by the size of its content.
            body.style.maxHeight = 'none';
        } else {
            // Set a max-height and activate scrolling.
            body.style.maxHeight = v;
        }
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
    opts = DB.extend({
        value: true, label: '', content: null, maxHeight: null,
        visible: true, wide: true
    }, opts, this );

    $.on( head, function() {
        that.value = !that.value;
    });

    this.append = function( item ) {
        if (!Array.isArray(that.content)) that.content = [];
        that.content.push( item );
        $.add( body, item );
        return that;
    };

    this.prepend = function( item ) {
        if (!Array.isArray(that.content)) that.content = [];
        that.content.push( item );
        body.insertBefore( item, body.childNodes[0] );
        return that;
    };
}


/**
 * @return void
 */
Showhide.prototype.clear = function() {
    this.content = [];
    return this;
};


/**
 * @class tfw.view.label
 * @param {string} value  - Text to display. If this  text starts with
 * `<html>`, it is parsed as HTML code.
 */
module.exports = Showhide;