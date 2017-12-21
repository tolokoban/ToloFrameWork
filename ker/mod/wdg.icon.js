var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Icons = require("tfw.icons");
var Touchable = require( "tfw.touchable" );

var ENUM = ['0', '1', 'P', 'PL', 'PD', 'S', 'SL', 'SD'];

/**
 * @class Icon
 * @param {string} opts.content - Name of the icon.
 * @param {object} opts.content - Structure of the icon.
 * @param {boolean} opts.rotate - Activer l'auto-rotation.
 * @param {string|number} opts.size - CSS size of the icon.
 */
var Icon = function ( opts ) {
  var that = this;

  var mapColors = [];
  var g = $.svg( 'g', {
    'stroke-width': 6,
    fill: "none",
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  } );
  var svg = $.svgRoot( 'wdg-icon', {
    width: '100%',
    height: '100%',
    viewBox: '-65 -65 130 130',
    preserveAspectRatio: "xMidYMid meet"
  } );
  var elem = $.elem( this, svg );
  $.add( svg, g );
  DB.prop( this, 'value' );
  DB.propBoolean( this, 'rotate' )( function ( v ) {
    if ( v ) {
      $.addClass( svg, "rotate" );
    } else {
      $.removeClass( svg, "rotate" );
    }
  } );
  DB.propUnit( this, 'size' )( function ( v ) {
    var s = v.v + v.u;
    $.css( svg, {
      width: s,
      height: s,
      'line-height': s
    } );
  } );
  DB.propAddClass( this, 'wide' );
  DB.propRemoveClass( this, 'visible', 'hide' );
  var updateColor = function ( index ) {
    var children = mapColors[ index ];
    if ( typeof children === 'undefined' ) return;
    children.fill.forEach(function (child) {
      ENUM.forEach(function (cls) {
        $.removeClass( child, cls );
      });
      $.removeAtt( child, 'fill' );
    });
    children.stroke.forEach(function (child) {
      ENUM.forEach(function (cls) {
        $.removeClass( child, cls );
      });
      $.removeAtt( child, 'stroke' );
    });

    var color = '' + that[ 'color' + index ];
    if( ENUM.indexOf( color ) > -1 ) {
      // This color is a class.
      children.fill.forEach( function ( child ) {
        $.addClass( child, 'fill' + color );
      } );
      children.stroke.forEach( function ( child ) {
        $.addClass( child, 'stroke' + color );
      } );
    } else {
      // This is a direct color.
      children.fill.forEach( function ( child ) {
        $.att( child, "fill", color );
      } );
      children.stroke.forEach( function ( child ) {
        $.att( child, "stroke", color );
      } );
    }
  };
  DB.prop( this, 'content' )( function( v ) {
    setContent.call( that, mapColors, g, v );
    for ( var i = 0; i < 2; i++ ) {
      updateColor(i);
    }
  });

  for ( var i = 0; i < 2; i++ ) {
    DB.propColor( this, 'color' + i )( updateColor.bind( this, i ) );
  }

  opts = DB.extend( {
    content: [ 'circle', {
      stroke: 1,
      fill: 0,
      r: 90,
      cx: 0,
      cy: 0
    } ],
    color0: '0',
    color1: '1',
    angle: 0,
    size: '2rem',
    value: "icon",
    rotate: false,
    wide: false,
    visible: true
  }, opts, this );
};

function setContent( mapColors, svg, v ) {
  $.clear( svg );
  if ( typeof v === 'string' ) {
    var def = Icon.Icons[ v.trim().toLowerCase() ];
    if ( typeof def !== 'undefined' ) v = def;
    else {
      try {
        v = JSON.parse( v );
      } catch ( ex ) {
        console.error( "[wdg.icon:content] Bad value: ", v );
        console.error( ex );
        return;
      }
    }
  }
  if ( !Array.isArray( v ) ) {
    console.error( "[wdg.icon:content] Value must be an array: ", v );
    return;
  }

  try {
    addChild.call( this, mapColors, svg, v );
  } catch ( ex ) {
    console.error( "[wdg.icon:content] Bad content: ", v );
    console.error( ex );
  }
}


function addChild( mapColors, parent, child ) {
  if ( typeof child === 'string' ) {
    var textNode = window.document.createTextNode( child );
    parent.appendChild( textNode );
    return;
  }
  if ( !Array.isArray( child ) || child.length == 0 ) {
    console.error( "[wdg.icon:content] `child` must be an array: ", child );
    console.error( "parent = ", parent );
    return;
  }

  var node;
  child.forEach( function ( itm, idx ) {
    var key, val, att, color;
    if ( idx == 0 ) {
      node = $.svg( itm );
      $.add( parent, node );
    } else {
      if ( typeof itm === 'string' ) {
        $.addClass( node, itm );
      } else if ( Array.isArray( itm ) ) {
        itm.forEach( function ( subchild ) {
          addChild.call( this, mapColors, node, subchild );
        }, this );
      } else if ( typeof itm === 'object' ) {
        for ( key in itm ) {
          val = '' + itm[ key ]; // Convert to string because 1 is not part of ENUM.
          if ( ( key == 'fill' || key == 'stroke' ) && ENUM.indexOf( val ) > -1 ) {
            if ( "01".indexOf( val ) > -1 ) {
              if ( typeof mapColors[ val ] === 'undefined' ) {
                mapColors[ val ] = {
                  fill: [],
                  stroke: []
                };
              }
              mapColors[ val ][ key ].push( node );
            }
          }
          $.att( node, key, val );
        }
      }
    }
  }, this );
}

Icon.Icons = Icons.iconsBook;
Icon.draw = Icons.draw;
Icon.path2 = Icons.path2;

/**
 * You can register more icons with this function.
 */
Icon.register = Icons.register;


module.exports = Icon;
