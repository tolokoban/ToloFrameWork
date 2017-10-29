"use strict";

var Binding = require("tfw.binding");
var Focusable = require("tfw.view.behaviour.focusable");
var Actionable = require("tfw.view.behaviour.actionable");

function Button( args ) {
  this.$ = document.createElement("button");
  defineProperties( this, args );
  bindElementEvents( this );
  Focusable( this );
  Actionable( this );
}

module.exports = Button;


function defineProperties( that, args ) {
  var button = that.$;
  Binding.defProps( that, {
    text: function(v) { button.textContent = v; },
    html: function(v) { button.innerHTML = v; }
  }, args );
}


function bindElementEvents( that ) {
  that.$.addEventListener( "click", function() {
    that.action = 1;
  }, false );
}

