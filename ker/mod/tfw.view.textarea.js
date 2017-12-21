"use strict";

var CODE_BEHIND = {
  onValueChanged: onValueChanged
};


function onValueChanged( text ) {
  var rows = getLinesCount( text );
  this.$elements.input.rows = Math.min( this.rows, rows );
}


function getLinesCount( text ) {
  var rows = 1;
  for( var i = 0 ; i < text.length ; i++ ) {
    if( text.charAt( i ) == '\n' ) rows++;
  }
  return rows;
}
