"use strict";

var Binding = require("tfw.binding");

module.exports = function( view ) {
  Binding.defAction( view, "action" );
  view.$.addEventListener( "keyup", function( evt ) {
    if( evt.key == 'Enter' || evt.kecCode == 13 ) {
      view.action = 1;
    }
  } );
};
