"use strict";

var CODE_BEHIND = {
  onValueChanged: onValueChanged,
  gotoLine: gotoLine
};


var $ = require("dom");

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


function gotoLine( lineNum ) {
  var input = $(this.$elements.input);
  var txt = this.value;
  var pos = 0;

  if( lineNum > 1 ) {
    for( pos = 0; pos < txt.length; pos++ ) {
      if( txt.charAt( pos ) === '\n' ) {
        lineNum--;
        if( lineNum < 2 ) break;
      }
    }
  }
  input.selectionStart = pos;
  input.selectionEnd = pos;
}
