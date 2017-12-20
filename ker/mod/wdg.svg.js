"use strict";

var $ = require("dom");


var CODE_BEHIND = {
  onContentChanged: onContentChanged
};


function onContentChanged( content ) {
  $.clear( this );
  if( !Array.isArray( content ) ) {
    content = [content];
  }

  content.forEach(function (item) {
    addTo( item, this );
  }, this);
}


function addTo( item, parent ) {
  if( typeof item === 'string' ) {
    $.add( parent, item );
    return;
  }
  
  var elem = $.svg( item[0] );
  $.add( parent, elem );

  var attName, attValue;
  for( attName in item ) {
    attValue = item[attName];
    if( attName == 1 ) {
      if( !Array.isArray( attValue ) ) attValue = [attValue];
      attValue.forEach(function (value) {
        addTo( value, elem );
      });
    } else {
      $.att( elem, attName, attValue );
    }
  }
}
