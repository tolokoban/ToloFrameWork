"use strict";

var CODE_BEHIND = {
  onValueChanged: onValueChanged,
  mapHeader: mapHeader
};

var $ = require("dom");

function onValueChanged( v ) {
  var i;
  var bodies = this.$elements.bodies.$;
  var headers = this.$elements.headers.$;

  for( i=0 ; i<headers.childNodes.length ; i++ ) {
    var header = headers.childNodes[i];
    if( i === v ) {
      $.addClass( header, "selected", "thm-bg3", "htm-ele2" );
    } else {
      $.removeClass( header, "selected", "thm-bg3", "htm-ele2" );
    }
  }
  
  for( i=0 ; i<bodies.childNodes.length ; i++ ) {
    var body = bodies.childNodes[i];
    if( i === v ) {
      $.removeClass( body, "hide" );
    } else {
      $.addClass( body, "hide" );
    }
  }
}


function mapHeader( caption ) {
  var that = this;
  var header = $.div("thm-fg", [ caption ]);
  $.on( header, function() {
    var index = that.headers.indexOf( caption );
    if( index === -1 ) return;
    that.value = index;
  });
  return header;
}
