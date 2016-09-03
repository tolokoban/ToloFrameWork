/**
 * @module wdg.flex
 *
 * @description
 * Simple flex alignement of children.
 *
 * @example
 * var mod = require('wdg.flex');
 */
var $ = require("dom");
var DB = require("tfw.data-binding");


var ENUM_ORIENTATION = ['H', 'V', 'W', 'N'];
var ENUM_TYPE = ['default', 'fill'];


function Flex(opts) {
    var elem = $.elem( this, 'div', 'wdg-flex' );

    DB.propToggleClass(this, 'orientation', ENUM_ORIENTATION);
    DB.propToggleClass(this, 'type', ENUM_TYPE);
    DB.propArray(this, 'content')(function(v) {
        $.clear( elem );
        v.forEach(function (itm) {
            $.add( elem, itm );
            if (typeof itm.$grow !== 'undefined') {
                $.css( itm, {'flex-grow': parseFloat(itm.$grow)} );
            }
            if (typeof itm.$shrink !== 'undefined') {
                $.css( itm, {'flex-shrink': parseFloat(itm.$shrink)} );
            }
        });
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        orientation: ENUM_ORIENTATION[0],
        type: ENUM_TYPE[0],
        content: [],
        wide: true,
        visible: true
    }, opts, this);
}

module.exports = Flex;
