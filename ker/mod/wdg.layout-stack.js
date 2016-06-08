/**
 * @module wdg.layout-stack
 *
 * @description
 * 
 *
 * @example
 * var Layout = require('wdg.layout-stack');
 * var layout = new Layout({
 *   value: "main",
 *   content: {
 *     main: ...,
 *     page: ...
 *   }
 * });
 */

var $ = require("dom");
var DB = require("tfw.data-binding");


var LayoutStack = function(opts) {
    var that = this;

    var elem = $.elem( this, 'div', 'wdg-layout-stack' );

    DB.propString(this, 'value')(function(v) {
        var key, val;
        for( key in that.content ) {
            val = that.content[key];
            if (typeof val.element() === 'function') {
                val = val.element();
            }
            else if (typeof val.element !== 'undefined') {
                val = val.element;
            }
            val.style.display = key == that.value ? 'block' : 'none';
        }
    });
    DB.prop(this, 'content')(function(v) {
        var key, val;
        for( key in v ) {
            val = v[key];
            if (typeof val.element() === 'function') {
                val = val.element();
            }
            else if (typeof val.element !== 'undefined') {
                val = val.element;
            }
            $.add( elem, $.div())
        }

    });

    opts = DB.extend({
        value: '',
        content: {},
        wide: false,
        visible: true
    }, opts, this);
};


module.exports = LayoutStack;
