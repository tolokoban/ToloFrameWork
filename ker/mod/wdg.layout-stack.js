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
    var children = {};

    DB.propString(this, 'value')(function(v) {
        var key, val;
        for( key in children ) {
            val = children[key];
            if (typeof val.element === 'function') {
                val = val.element();
            }
            else if (typeof val.element !== 'undefined') {
                val = val.element;
            }
            val.style.display = key == that.value ? 'block' : 'none';
        }
    });
    DB.prop(this, 'content')(function(v) {
        if (Array.isArray( v )) {
            // Convert array into map.
            // Each item should have the `$key` property.
            // If not, an incremental ID will be provided.
            var obj = {};
            v.forEach(function (itm, idx) {
                if( typeof itm.$key === 'undefined' ) itm.$key = idx;
                obj[itm.$key] = itm;
            });
            v = obj;
        }

        // Clearing current element to add children.
        $.clear( elem );

        var key, val, container;
        for( key in v ) {
            val = v[key];
            if (typeof val.element === 'function') {
                val = val.element();
            }
            else if (typeof val.element !== 'undefined') {
                val = val.element;
            }
            container = $.div([val]);
            if (typeof val.$scroll !== 'undefined') {
                $.addClass( container, 'scroll' );
            }
            $.add( elem, container );
        }

        children = v;
        DB.fire( that, 'value' );
    });

    opts = DB.extend({
        value: '',
        content: {},
        wide: false,
        visible: true
    }, opts, this);
};


module.exports = LayoutStack;
