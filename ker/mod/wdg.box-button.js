"use strict";
/**
 * @module wdg.box-button
 *
 * @description
 * A box button is a box containing  any piece of HTML. The box can be
 * clicked and has an elevation animation.
 *
 * @example
 * var mod = require('wdg.box-button');
 */

var $ = require("dom");
var DB = require("tfw.data-binding");
var Touchable = require("tfw.touchable");

/**
 * @param {object} opts
 * * {boolean} `enabled`: Mettre `false` pour désactiver le bouton.
 * * {boolean} `selected`: Highlight the button if selected.
 * * {object} `content`: Associe le _Tap_ à l'envoi d'un mail.
 * * {any} `value`: A value to set to `action` whan tap occured.
 *
 * @example
 * var BoxButton = require("wdg.box-button");
 * var btn = new BoxButton({ content: $.div(['Hello world!']), value: 'OK' });
 * @class BoxButton
 */
var BoxButton = function(opts) {
    var that = this;

    var elem = $.elem( this, 'div', 'wdg-box-button', 'theme-elevation-2' );

    // Animate the pressing.
    var touchable = new Touchable( elem, {
        classToAdd: 'theme-elevation-8',
        color: "#777"
    });
    touchable.tap.add( this.fire.bind( this ) );
    
    var refresh = function() {
        $.removeClass( 
            elem, 'theme-color-bg-4', 'theme-color-bg-B0', 'theme-color-bg-B5'
        );
        touchable.enabled = that.enabled;
        if (!that.enabled) {
            $.addClass( elem, 'theme-color-bg-B5' );
        }
        else if (that.selected) {
            $.addClass( elem, 'theme-color-bg-4' );
            touchable.color = "#fff";
        }
        else {
            $.addClass( elem, 'pointer', 'theme-color-bg-B0' );
            touchable.color = "#9cd";
        }
    };

    DB.prop(this, 'value');
    DB.propBoolean(this, 'enabled')(refresh);
    DB.propBoolean(this, 'selected')(refresh);
    DB.prop(this, 'content')(function(v) {
        $.clear(elem);
        if (!Array.isArray(v)) v = [v];
        v.forEach(function (itm) {
            $.add(elem, itm);            
        });
    });
    DB.prop(this, 'action', 0);
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        content: [],
        value: "action",
        action: 0,
        enabled: true,
        selected: false,
        wide: false,
        visible: true
    }, opts, this);
};

/**
 * @class BoxButton
 * @function on
 * @param {function} slot - Function to call when `action` has changed.
 */
BoxButton.prototype.on = function(slot) {
    return DB.bind( this, 'action', slot );
};

/**
 * Simulate a click on the button if it is enabled.
 */
BoxButton.prototype.fire = function() {
    if (this.enabled) {
        DB.fire( this, 'action', this.value );
    }
};


module.exports = BoxButton;
