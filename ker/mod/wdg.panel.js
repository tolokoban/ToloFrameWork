/**
 * @module wdg.panel
 *
 * @description
 * A panel is invisible, but it can show/hide its content.
 *
 * @example
 * var mod = require('wdg.panel');
 */
var $ = require("dom");
var DB = require("tfw.data-binding");


function Panel( opts ) {
    var elem = $.elem( this, 'div', 'wdg-panel' );

    DB.prop(this, 'content')(function(v) {
        $.clear( elem );
        if (Array.isArray( v )) {
            v.forEach(function (itm) {
                $.add( elem, itm );
            });
        } else if (typeof v !== 'undefined' && v !== null){
            $.add( elem, v );
        }
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        visible: true, wide: true, content: []
    }, opts, this );
}



module.exports = Panel;
