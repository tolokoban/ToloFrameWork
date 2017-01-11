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

"use strict";

var $ = require("dom");

var Touchable = function(elem, opts) {
    if( typeof opts === 'undefined' ) opts = {};
    this.color = opts.color || "#fff";
    this.opacity = opts.opacity || .3;
    this.element = elem;
    
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
