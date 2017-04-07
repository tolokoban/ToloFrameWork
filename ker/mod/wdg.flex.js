/**
 * @module wdg.flex
 * 
 * @class flex
 * @param {string} opts.orientation - One of `H`, `V`, `W`, `N`. 
 * Default is `H`.
 * * `H`: Horizontal.
 * * `V`: Vertical.
 * * `W`: Wide. In direction of the wider dimension: H in landscape and V in portrait.
 * * `N`: Narrow. Exact opposite of `W`.
 * @param {string} opts.type - One of `default`, `fill`. Default is `default`.
 *
 * @description
 * Simple flex alignement of children.
 *
 * @example
 * var mod = require('wdg.flex');
 */
var $ = require( "dom" );
var DB = require( "tfw.data-binding" );


var ENUM_ORIENTATION = [ 'H', 'V', 'W', 'N' ];
var ENUM_TYPE = [ 'default', 'fill' ];


function Flex( opts ) {
  var elem = $.elem( this, 'div', 'wdg-flex' );

  DB.propToggleClass( this, 'orientation', ENUM_ORIENTATION );
  DB.propToggleClass( this, 'type', ENUM_TYPE );
  DB.propArray( this, 'content' )( function ( v ) {
    $.clear( elem );
    v.forEach( function ( itm ) {
      $.add( elem, itm );
      if ( typeof itm.$grow !== 'undefined' ) {
        $.css( itm, {
          'flex-grow': parseFloat( itm.$grow )
        } );
      }
      if ( typeof itm.$shrink !== 'undefined' ) {
        $.css( itm, {
          'flex-shrink': parseFloat( itm.$shrink )
        } );
      }
    } );
  } );
  DB.propString( this, 'justify' )( function ( v ) {
    $.removeClass( elem,
      'justify-center', 'justify-flex-end', 'justify-flex-start',
      'justify-space-around', 'justify-space-between' );
    var cls = null;
    switch ( v.trim().toLowerCase() ) {
    case 'center':
      cls = 'center';
      break;
    case 'flex-end':
    case 'flexend':
    case 'end':
      cls = 'flex-end';
      break;
    case 'flex-start':
    case 'flexstart':
    case 'start':
      cls = 'flex-start';
      break;
    case 'space-around':
    case 'around':
      cls = 'space-around';
      break;
    case 'space-between':
    case 'between':
      cls = 'space-between';
      break;
    }
    if ( cls ) {
      $.addClass( elem, 'justify-' + cls );
    }
  } );
  DB.propAddClass( this, 'wide' );
  DB.propRemoveClass( this, 'visible', 'hide' );

  opts = DB.extend( {
    orientation: ENUM_ORIENTATION[ 0 ],
    type: ENUM_TYPE[ 0 ],
    justify: "space-around",
    content: [],
    wide: true,
    visible: true
  }, opts, this );
}

module.exports = Flex;