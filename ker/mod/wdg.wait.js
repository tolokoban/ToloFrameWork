"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var Css = require("tfw.css");
var Icon = require("wdg.icon");


/**
 * @class Wait
 *
 * Arguments:
 * * __visible__ {boolean}: Visibility of the component.
 *
 * @example
 * var Wait = require("wdg.wait");
 * var instance = new Wait({visible: false});
 */
var Wait = function(opts) {
    var caption = $.div();
    var icon = new Icon({ content: 'wait', rotate: true });
    var elem = $.elem( this, 'div', 'wdg-wait', [icon, caption] );
    
    DB.propRemoveClass( this, 'visible', 'hide' );
    DB.propString( this, 'size' )(function(v) {
        icon.size = v;
        // We parse the CSS size because we want to text to be 75% of the icon.
        var unit = Css.parseUnit(v);
        $.css( caption, {
            'font-size': (unit.v * .75) + unit.u,
            'padding-left': (unit.v * .5) + unit.u
        });
    });
    DB.propString( this, 'caption' )(function(v) {
        caption.textContent = v;
    });
    
    opts = DB.extend({
        size: '24px',
        caption: '',
        visible: true
    }, opts, this);
};


module.exports = Wait;
