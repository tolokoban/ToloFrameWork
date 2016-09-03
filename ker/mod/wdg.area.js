"use strict";
var $ = require("dom");
var Fx = require("dom.fx");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");


/**
 * @class AreaEditor
 */
var Area = function( opts ) {
    var that = this;

    var elem = $.elem(this, 'div', 'wdg-area', 'theme-elevation-2');
    var iconFullscreen = new Icon({ content: Icon.Icons.fullscreen, size: '1.5rem', button: true });
    var label = $.div('theme-label');
    var header = $.div('header', 'theme-color-bg-1', [iconFullscreen, label]);
    var slider = $.div('slider');
    var area = $.tag('textarea');
    var body = $.div('body', [area]);
    $.add( elem, header, body, slider);

    DB.propBoolean(this, 'focus')(function(v) {
        if (v) {
            area.focus();
        } else {
            area.blur();
        }
    });
    DB.propString(this, 'label')(function(v) {
        if (typeof v === 'number') v = '' + v;
        if (typeof v !== 'string') v = '';
        label.textContent = v;
    });
    DB.propInteger(this, 'height')(function(v) {
        $.css(elem, {height: v + "px"});
    });
    DB.propString(this, 'value')(function(v) {
        area.value = v;
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    DB.extend({
        label: "",
        value: "",
        height: 90,
        wide: true,
        visible: true
    }, opts, this);

    var initialHeight = this.height;

    $.on( slider, {
        down: function() {
            initialHeight = that.height;
        },
        drag: function(evt) {
            that.height = Math.max( 90, initialHeight + evt.dy );
        }
    });

    // Managing fullscreen display.
    var fullscreen = new Fx.Fullscreen({
        target: elem
    });
    DB.bind(iconFullscreen, 'action', function() {
        fullscreen.value = !fullscreen.value;
    });

    area.addEventListener('blur', function() {
        that.value = area.value;
    }, false);
};

module.exports = Area;
