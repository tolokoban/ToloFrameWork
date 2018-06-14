"use strict";

var CODE_BEHIND = {
  init: init,
  on: on,
  onKeyUp: onKeyUp
};

var PM = require("tfw.binding.property-manager");
var Touchable = require("tfw.touchable");

function on( action ) {
  PM( this ).on( "value", action );
}

function onKeyUp( evt ) {
  if( ["enter", "space"].indexOf( evt.code.toLowerCase() ) > -1 ) {
    this.value = !this.value;
  }
}

function init() {
  new Touchable( this.$ );
}
