"use strict";

var $ = require("dom");


var CODE_BEHIND = {
  onAction: onAction
};


function onAction() {
  var input = this.$elements.input;
  ensureInputHasEventListener.call( this, input.$ );
  $.addClass( this.$elements.filename, "hide" );
  input.$.click();
}


function ensureInputHasEventListener( element ) {
  if( this._inputHasEventListener ) return;
  this._inputHasEventListener = true;
  
  var that = this;
  var divFilename = this.$elements.filename.$;
  
  element.addEventListener( "change", function(evt) {
    var files = evt.target.files;
    if( files.length === 0 ) return;
    var file = files[0];
    divFilename.textContent = file.name;
    $.removeClass( divFilename, "hide" );
    that.file = file;
  }, false);
}
