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
var Hash = require("tfw.hash-watcher");


var LayoutStack = function(opts) {
    var that = this;

    var elem = $.elem( this, 'div', 'wdg-layout-stack' );
    var children = {};

    var onHashChange = function( args, hash ) {
        var rx = that.hash;
        if (!rx) return;
        var m = rx.exec( hash );
        if (!m) return;
        if (m.length < 2) return;
        that.value = m[1];
    };

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
            val = val.parentNode;
            if (val) {
                if (key == v) {
                    $.addClass( val, 'fade-in' );
                    $.removeClass( val, 'fade-out' );
                } else {
                    $.addClass( val, 'fade-out' );
                    $.removeClass( val, 'fade-in' );
                }
            }
        }
    });
    DB.propRegexp(this, 'hash')(function() {
        Hash( onHashChange );
    });
    DB.prop(this, 'content')(function(v) {
        if (Array.isArray( v )) {
            // Convert array into map.
            // Each item should have the `$key` property.
            // If not, an incremental ID will be provided.
            var obj = {};
            var firstKey;
            v.forEach(function (itm, idx) {
                if( typeof itm.$key === 'undefined' ) itm.$key = idx;
                obj[itm.$key] = itm;
                if( typeof firstKey === 'undefined' ) itm.$key = firstKey;
            });
            v = obj;
            DB.fire(that, 'value', firstKey);
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
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        value: '',
        content: {},
        hash: null,
        wide: false,
        visible: true
    }, opts, this);
};


module.exports = LayoutStack;
