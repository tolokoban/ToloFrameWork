"use strict";

/**
 * @module tfw.touchable
 *
 * @description
 * Turn  a DOM  element  into  a touchable  one  with material  design
 * animation: a growing transparent disk.
 *
 * @example
 * var Touchable = require('tfw.touchable');
 * var div = document.querySelector('#button');
 * var touchable = new Touchable( div, {
 *   opacity: .2,
 *   color: "white"
 * });
 * touchable.tap.add(function() { ... });
 * touchable.press.add(function() { ... });
 */

var $ = require("dom");
var Fx = require("dom.fx");
var Listeners = require("tfw.listeners");

var Touchable = function(elem, opts) {
    var that = this;

    if( typeof opts === 'undefined' ) opts = {};
    if( typeof opts.enabled === 'undefined' ) opts.enabled = true;
    elem = $( elem );
    this.enabled = opts.enabled;
    this.color = opts.color || "#888";
    this.classToAdd = opts.classToAdd;
    this.opacity = opts.opacity || .3;
    this.element = $(elem);
    this.tap = new Listeners();
    this.press = new Listeners();

    $.addClass( elem, 'tfw-touchable' );
    var shadow = $.div( 'tfw-touchable-shadow' );
    var time = 0;
    var lastX, lastY;
    var removeShadow = 0;

    $.on(elem, {
        down: function(evt) {
            console.log("DOWN");
            if( !that.enabled ) return;
            if( removeShadow ) {
                window.clearTimeout( removeShadow );
                removeShadow = 0;
            }
            var position = getComputedStyle(elem).position;
            if( ['relative', 'absolute', 'fixed'].indexOf( position ) == -1 ) {
                elem.style.position = 'relative';
            }
            $.pushStyle( elem, 'overflow', 'hidden' );
            var cls = that.classToAdd;
            if( typeof cls === 'string' ) {
                $.addClass( elem, cls );
            }
            lastX = evt.x;
            lastY = evt.y;
            var rect = elem.getBoundingClientRect();
            var w = rect.width;
            var h = rect.height;
            w = Math.max( lastX, w - lastX );
            h = Math.max( lastY, h - lastY );
            var radius = Math.ceil( Math.sqrt( w*w + h*h ) );
            $.css( shadow, {
                left: lastX + "px",
                top: lastY + "px",
                margin: "-" + radius + "px",
                width: 2*radius + "px",
                height: 2*radius + "px",
                opacity: that.opacity,
                background: that.color
            });
            $.removeClass( shadow, "fade" );
            window.setTimeout( $.addClass.bind( $, shadow, "grow" ) );
            $.add( elem, shadow );
            removeShadow = window.setTimeout(function() {
                $.removeClass( shadow, "grow" );
                $.addClass( shadow, "fade" );
                removeShadow = window.setTimeout(function() {
                    $.detach( shadow );
                    $.popStyle( elem, 'overflow' );
                    $.removeClass( shadow, "fade" );
                }, 3000);
            }, 300);
            time = Date.now();
        },
        up: function(evt) {
            console.log("UP");
            if( !that.enabled ) return;
            var cls = that.classToAdd;
            if( typeof cls === 'string' ) {
                $.removeClass( elem, cls );
            }
            var x = evt.x - lastX;
            var y = evt.y - lastY;
            if( x*x + y*y > 1000 ) return;
            console.log('TAP', evt);
            that.tap.fire( evt );
        }
    });
};


module.exports = Touchable;



/*
 https://jsfiddle.net/mzmaczdn/7/


 var div = document.createElement('div');
 div.className = 'shadow';

 var btn = document.querySelector('button');
 btn.addEventListener('mousedown', function(evt) {
 btn.className = "press";
 btn.appendChild( div );
 div.style.left = evt.offsetX + "px";
 div.style.top = evt.offsetY + "px";
 window.setTimeout(function() {
 div.style.transform = "scale(1)";
 });
 });

 btn.addEventListener('mouseup', function(evt) {
 div.style.transform = "scale(0)";
 btn.removeChild(div);
 });
 */
