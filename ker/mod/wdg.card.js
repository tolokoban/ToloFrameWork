"use strict";

var $ = require("dom");
var DB = require("tfw.data-binding");

/**

@TODO A terminer...

 * @param {boolean} opts.visible - Set the visiblity of the component.
 * @param {boolean} opts.expanded - If `true`, the card is expanded and modal.
 * @param {array} opts.head - Content of the header. This is the only part always visible.
 * @param {array} opts.body - Content of the body: visible only when expanded.
 *
 * @example
 * var Card = require("wdg.card");
 * var instance = new Card({visible: false});
 */
var Card = function(opts) {
  var head = $.div('head');
  var body = $.div('body');
  var elem = $.elem( this, 'div', 'wdg-card', [head] );
  
  DB.propRemoveClass( this, 'visible', 'hide' );
  DB.prop( this, 'head' )( function ( v ) {
    $.clear( head );
    if ( Array.isArray( v ) ) {
      v.forEach( function ( itm ) {
        $.add( head, itm );
      } );
    } else if ( typeof v !== 'undefined' && v !== null ) {
      $.add( head, v );
    }
  } );
  DB.prop( this, 'body' )( function ( v ) {
    $.clear( body );
    if ( Array.isArray( v ) ) {
      v.forEach( function ( itm ) {
        $.add( body, itm );
      } );
    } else if ( typeof v !== 'undefined' && v !== null ) {
      $.add( body, v );
    }
  } );

  opts = DB.extend({
    visible: true,
    head: [],
    body: [],
    expanded: false
  }, opts, this);
};


module.exports = Card;
