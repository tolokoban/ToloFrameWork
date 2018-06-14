"use strict";

var CODE_BEHIND = {
  onSrcChanged: onSrcChanged,
  onLoad: onLoad,
  onError: onError,
  onWidthChanged: onWidthChanged,
  onHeightChanged: onHeightChanged,
  onMaxWidthChanged: onMaxWidthChanged,
  onMaxHeightChanged: onMaxHeightChanged
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


function onWidthChanged( unit ) {
  if( unit == 'auto' ) return;
  $.css(this, { width: unit });
}


function onHeightChanged( unit ) {
  if( unit == 'auto' ) return;
  $.css(this, { height: unit });
}

function onMaxWidthChanged( unit ) {
  if( unit == 'auto' ) return;
  $.css(this, { "max-width": unit });
}


function onMaxHeightChanged( unit ) {
  if( unit == 'auto' ) return;
  $.css(this, { "max-height": unit });
}
