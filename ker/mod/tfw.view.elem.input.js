"use strict";

var Binding = require("tfw.binding");
var Focusable = require("tfw.view.behaviour.focusable");
var Actionable = require("tfw.view.behaviour.actionable");

function Input( args ) {
  this.$ = document.createElement("input");
  defineProperties( this, args );
  bindElementEvents( this );
  Focusable( this );
  Actionable( this );
}

module.exports = Input;


function defineProperties( that, args ) {
  var input = that.$;
  Binding.defProps( that, {
    value: function(v) { input.value = v; },
    type: function(v) { input.type = v; },
    hidden: {
      set: function(v) { input.hidden = v; },
      cast: require("tfw.converter.boolean")()
    },
    placeholder: function(v) { input.placeholder = v; }
  }, args );
}

function bindElementEvents( that ) {
  var input = that.$;
  on( input, {
    "input": function() { that.value = input.value; }
  } );
}

function on( obj, events ) {
  var name, action;
  for( name in events ) {
    action = events[name];
    obj.addEventListener( name, action, false );
  }
}
