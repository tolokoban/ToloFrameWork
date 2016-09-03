"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Global = require("$");

/**
 * @class IntlView
 *
 * Arguments:
 * * __visible__ {boolean}: Visibility of the component.
 *
 * @example
 * var IntlView = require("wdg.intl-view");
 * var instance = new IntlView({visible: false});
 */
var IntlView = function(opts) {
    var elem = $.elem( this, 'p', 'wdg-intl-view' );
    
    DB.propRemoveClass( this, 'visible', 'hide' );
    DB.prop( this, 'content' )(function(v) {
        var html = '';
        if (!Array.isArray(v)) v = [v];
        v.forEach(function (itm) {
            if (typeof itm === 'string') {
                html += itm;
            } else {
                html += itm[Global.lang()];
            }
        });
        elem.innerHTML = html;
    });

    opts = DB.extend({
        content: '',
        visible: true
    }, opts, this);
};


module.exports = IntlView;
