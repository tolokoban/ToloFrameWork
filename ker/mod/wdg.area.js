/**
 * @class Area
 *
 * @param {string} value - Text displayed in the area view.
 * @param {string} label - Label to display above the text area.
 * @param {boolean} enabled - Enable/Disable the text area.
 * @param {number} rows - Minimum number of rows.
 * @param {number} cols - Minimum number of cols.
 * @param {boolean} wide - Take the full width.
 */

"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");
var LaterAction = require( "tfw.timer" ).laterAction;


/**
 * @class AreaEditor
 */
var Area = function( opts ) {
  var that = this;

  var label = $.div( 'label' );
  var input = $.tag( 'textarea', 'thm-ele2' );

  var elem = $.elem(this, 'div', 'wdg-area', [label, input]);

  DB.propBoolean(this, 'focus')(function(v) {
    if (v) {
      input.focus();
    } else {
      input.blur();
    }
  });
  DB.propString(this, 'label')(function(v) {
    if (typeof v === 'number') v = '' + v;
    if (typeof v !== 'string') v = '';
    label.textContent = v;
  });
  DB.propInteger(this, 'maxrows');
  DB.propInteger(this, 'rows')(function(v) {
    $.att( input, { rows: v } );
  });
  DB.propInteger(this, 'cols')(function(v) {
    $.att( input, { cols: v } );
  });
  DB.propString(this, 'value')(function(v) {
    input.value = v;
  });
  DB.propBoolean( this, 'enabled' )( function ( v ) {
    if ( v ) {
      $.removeAtt( input, 'disabled' );
    } else {
      $.att( input, {
        disabled: v
      } );
    }
  } );
  DB.propAddClass(this, 'wide');
  DB.propRemoveClass(this, 'visible', 'hide');
  
  DB.extend({
    label: "",
    value: "",
    cols: 20,
    rows: 2,
    maxrows: 8,
    wide: true,
    visible: true
  }, opts, this);

  input.addEventListener('keyup', function(evt) {
    that.value = input.value;
    console.info("[wdg.area] =evt.keyCode", evt.keyCode);
    switch( evt.keyCode ) {
    case 13:
      grow( input, that.rows, that.maxrows );
      break;
    }
  }, false);

  input.addEventListener('focus', function() {
    $.removeClass( input, 'thm-ele2' );
    $.addClass( input, 'thm-ele4' );
    $.addClass( input, 'thm-bgSL' );
  }, false);
  
  input.addEventListener('blur', function() {
    $.addClass( input, 'thm-ele2' );
    $.removeClass( input, 'thm-ele4' );
    $.removeClass( input, 'thm-bgSL' );
  }, false);
};

module.exports = Area;


/**
 * Check the number of rows regarding the inner text.
 */
function grow(area, min, max) {
  if( typeof min !== 'undefined' ) {
    min = parseInt( min );
    if( isNaN( min ) ) min = 2;
  }
  if( typeof max !== 'undefined' ) {
    max = parseInt( max );
    if( isNaN( max ) ) max = 8;
  }
  if( max < min ) max = min;

  var text = area.value;
  var lines = 1;
  var index = -1;
  for(;;) {
    index = text.indexOf( "\n", index + 1 );
    if( index === -1 ) break;
    lines++;
  }
  index = Math.max( min, Math.min( max, index ) );
  $.att( area, {rows: lines} );
}
