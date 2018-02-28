"use strict";

var CODE_BEHIND = {
  onSrcChanged: onSrcChanged,
  onLoad: onLoad,
  onError: onError
};


var $ = require("dom");

function onSrcChanged( src ) {
  $.addClass( this, "hide" );
  this.loaded = false;
  this.failed = false;
}


function onLoad() {
  $.removeClass( this, "hide" );
  this.loaded = true;
  this.failed = false;
}


function onError() {
  this.loaded = false;
  this.failed = true;
}
