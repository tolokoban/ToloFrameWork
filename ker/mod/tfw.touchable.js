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
module.exports = Touchable;

const $ = require("dom"),
    Fx = require("dom.fx"),
    Listeners = require("tfw.listeners");

/**
 * @class Touchable
 * @param {any} elem - DOMElement or string representing a DOM ID.
 * @param {object} opts - Options.
 * @param {boolean} opts.enabled - .
 * @param {string} opts.color - CSS color.
 * @returns {undefined}
 */
function Touchable(elem, opts = {}) {
    const that = this,
        target = {elem: null},
        shadow = $.div("tfw-touchable-shadow"),
        container = $.div("tfw-touchable-container", [shadow]);

    if (typeof opts.enabled === "undefined") opts.enabled = true;

    this.enabled = opts.enabled;
    this.color = opts.color || "#333";
    this.classToAdd = opts.classToAdd;
    this.opacity = opts.opacity || 0.4;
    this.element = $(elem);
    this.tap = new Listeners();
    this.press = new Listeners();

    let lastX = 0,
        lastY = 0;

    $.addClass(elem, "tfw-touchable-elem");

    const fxDown = Fx()
        .css(shadow, {
            transition: "none",
            transform: "scale(0)"
        })
        .exec(function() {
            const cls = that.classToAdd;
            if (typeof cls === "string") {
                $.addClass(elem, cls);
            }
            const rect = target.elem.getBoundingClientRect(),
                w = Math.max(lastX, rect.width - lastX),
                h = Math.max(lastY, rect.height - lastY),
                radius = Math.ceil(Math.sqrt(w * w + h * h));
            $.css(shadow, {
                left: `${lastX}px`,
                top: `${lastY}px`,
                margin: `-${radius}px`,
                width: `${2 * radius}px`,
                height: `${2 * radius}px`,
                opacity: 0,
                background: that.color,
                transform: "scale(0)",
                transition: "all .15s ease",
                "transition-timing-function": "cubic-bezier(0,1,0.780,1)",
                "-moz-transition-timing-function": "cubic-bezier(0,1,0.780,1)",
                "-webkit-transition-timing-function":
                    "cubic-bezier(0,1,0.780,1)"
            });
            $.clear(target.elem, container);
        })
        .wait(10)
        .css(shadow, {
            opacity: that.opacity,
            transform: "scale(.25)"
        })
        .wait(150)
        .css(shadow, {transform: "scale(.2)"})
        .wait(150)
        .css(shadow, {
            transition: "all .6s ease",
            transform: "scale(1)",
            opacity: 0
        })
        .wait(600)
        .exec(function() {
            $.detach(target.elem);
            const cls = that.classToAdd;
            if (typeof cls === "string") {
                $.removeClass(elem, cls);
            }
        });

    $.on(elem, {
        down(evt) {
            if (!that.enabled) return;
            evt.stopPropagation();
            evt.preventDefault();
            lastX = Math.floor(evt.x);
            lastY = Math.floor(evt.y);
            target.elem = makeFixedElementWithSameShape(elem);
            $.add(document.body, target.elem);
            fxDown.start();
        },
        tap(evt) {
            if (!that.enabled) {
                console.log("DISABLED!");
                return;
            }
            that.tap.fire(evt);
        },
        doubletap(evt) {
            if (!that.enabled) {
                console.log("DISABLED!");
                return;
            }
            that.press.fire(evt);
        }
    });
}

/**
 * @param {DOMElement} elem - Element from which to make a new element with the same shape but fixed.
 * @returns {undefined}
 */
function makeFixedElementWithSameShape(elem) {
    const rect = $(elem).getBoundingClientRect(),
        copy = $.div("tfw-touchable");

    $.css(copy, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: window
            .getComputedStyle($(elem))
            .getPropertyValue("border-radius")
    });
    return copy;
}
