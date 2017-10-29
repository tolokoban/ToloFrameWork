"use strict";

var Binding = require("tfw.binding");

module.exports = function( view ) {
  var elem = view.$;
  Binding.defProp( view, "focus", {
    set: function(v) {
      if( v ) elem.focus();
      else elem.blur();
    },
    cast: require("tfw.converter.boolean")()
  } );

  elem.addEventListener( "focus", function() { view.focus = true; } );
  elem.addEventListener( "blur", function() { view.focus = false; } );
};
