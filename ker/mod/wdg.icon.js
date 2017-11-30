var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
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

function draw( d ) {
  return [ 'g', [
    [ 'path', {
      d: d,
      stroke: 1,
      'stroke-width': 36
    } ],
    [ 'path', {
      d: d,
      stroke: 0,
      'stroke-width': 24
    } ]
  ] ];
}

function path2( d ) {
  return [ 'g', [
    [ 'path', {
      d: d,
      stroke: 1,
      fill: 'none',
      'stroke-width': 12
    } ],
    [ 'path', {
      d: d,
      stroke: 'none',
      fill: 0
    } ]
  ] ];
};

Icon.Icons = {
  android: path2(
    'M15,-35H10V-40H15M-10,-35H-15V-40H-10M18,-49L24,-56C25,-57,25,-58,24,-59C23,-60,22,-60,21,-59L13,-52C9,-54,5,-55,0,-55C-5,-55,-9,-54,-13,-52L-21,-59C-22,-60,-23,-60,-24,-59C-25,-58,-25,-57,-24,-56L-18,-49C-25,-44,-30,-35,-30,-25H30C30,-35,25,-44,18,-49M43,-20A8,8,0,0,0,35,-12V23A8,8,0,0,0,43,30A8,8,0,0,0,50,23V-12A8,8,0,0,0,43,-20M-42,-20A8,8,0,0,0,-50,-12V23A8,8,0,0,0,-42,30A8,8,0,0,0,-35,23V-12A8,8,0,0,0,-42,-20M-30,30A5,5,0,0,0,-25,35H-20V53A8,8,0,0,0,-12,60A8,8,0,0,0,-5,53V35H5V53A8,8,0,0,0,13,60A8,8,0,0,0,20,53V35H25A5,5,0,0,0,30,30V-20H-30V30Z'
  ),
  bug: path2(
    "M10,0H-10V-10H10M10,20H-10V10H10M40,-20H26C24,-24 21,-27 17,-30L25,-38L18,-45L7,-34C5,-35 3,-35 0,-35C-2,-35 -5,-35 -7,-34L-18,-45L-25,-38L-17,-30C-21,-27 -24,-24 -26,-20H-40V-10H-30C-30,-8 -30,-7 -30,-5V0H-40V10H-30V15C-30,17 -30,18 -30,20H-40V30H-26C-21,39 -11,45 0,45C11,45 21,39 26,30H40V20H30C30,18 30,17 30,15V10H40V0H30V-5C30,-7 30,-8 30,-10H40V-20Z"
  ),
  camera: path2(
    'M-40,-40H-25L-15,-50H15L25,-40H40A10,10,0,0,1,50,-30V30A10,10,0,0,1,40,40H-40A10,10,0,0,1,-50,30V-30A10,10,0,0,1,-40,-40M0,-25A25,25,0,0,0,-25,0A25,25,0,0,0,0,25A25,25,0,0,0,25,0A25,25,0,0,0,0,-25M0,-15A15,15,0,0,1,15,0A15,15,0,0,1,0,15A15,15,0,0,1,-15,0A15,15,0,0,1,0,-15Z'
  ),
  cancel: [ 'g', [
    [ 'path', {
      d: 'M-30,-30L30,30M-30,30L30,-30',
      stroke: 0,
      'stroke-width': 30
    } ],
    [ 'path', {
      d: 'M-30,-30L30,30M-30,30L30,-30',
      stroke: 1,
      'stroke-width': 16
    } ]
  ] ],
  center: path2(
    'M0,-15A15,15,0,0,0,-15,0A15,15,0,0,0,0,15A15,15,0,0,0,15,0A15,15,0,0,0,0,-15M35,35H15V45H35A10,10,0,0,0,45,35V15H35M35,-45H15V-35H35V-15H45V-35A10,10,0,0,0,35,-45M-35,-35H-15V-45H-35A10,10,0,0,0,-45,-35V-15H-35M-35,15H-45V35A10,10,0,0,0,-35,45H-15V35H-35V15Z'
  ),
  close: draw( 'M-40,-40L40,40M-40,40L40,-40' ),
  code: path2( 'M13,23L36,0L13,-23L20,-30L50,0L20,30L13,23M-13,23L-36,0L-13,-23L-20,-30L-50,0L-20,30L-13,23Z' ),
  delete: path2(
    'M35,-40H18L13,-45H-12L-17,-40H-35V-30H35M-30,35A10,10,0,0,0,-20,45H20A10,10,0,0,0,30,35V-25H-30V35Z' ),
  direction: path2('M10,13V0H-10V15H-20V-5A5,5,0,0,1,-15,-10H10V-22L28,-5M49,-4L4,-49H3C2,-50,-2,-50,-4,-49L-49,-4C-50,-2,-50,2,-49,4L-4,49C-2,50,2,51,4,49L49,4C51,2,51,-2,49,-4Z'),
  down: draw( 'M-30,-30L0,30,30,-30' ),
  'down-double': draw( 'M-30,-40L0,-10,30,-40M-30,10L0,40,30,10' ),
  edit: path2(
    "M24,-46C22,-46,20,-46,19,-44L8,-34L35,-7L45,-17C48,-21,48,-25,45,-28L29,-44C28,-46,26,-46,24,-46M5,-30L-36,11L-23,12L-22,23L-11,24L-9,37L31,-3M-39,15L-47,49L-14,40L-15,29L-27,28L-28,16"
  ),
  eraser: path2('M21,-42L46,-17C50,-14,50,-7,46,-3L0,43C-8,50,-20,50,-28,43L-46,25C-50,21,-50,15,-46,11L7,-42C11,-46,17,-46,21,-42M-39,18L-21,36C-17,39,-11,39,-7,36L11,18L-14,-7L-39,18Z'),
  'export': path2( 'M-35,40H35V30H-35M35,-15H15V-45H-15V-15H-35L0,20L35,-15Z' ),
  "flag-jp": [ "g", {
    stroke: "none"
  }, [
    [ "path", {
      fill: "#000",
      d: "M-65,50h130v-100h-130z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,45h120v-90h-120z"
    } ],
    [ "circle", {
      fill: "#bc002d",
      r: 24
    } ]
  ] ],
  "flag-fr": [ "g", {
    stroke: "none"
  }, [
    [ "path", {
      fill: "#000",
      d: "M-65,50h130v-100h-130z"
    } ],
    [ "path", {
      fill: "#002395",
      d: "M-60,45h40v-90h-40z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-20,45h40v-90h-40z"
    } ],
    [ "path", {
      fill: "#ed2939",
      d: "M20,45h40v-90h-40z"
    } ]
  ] ],
  "flag-it": [ "g", {
    stroke: "none"
  }, [
    [ "path", {
      fill: "#000",
      d: "M-65,50h130v-100h-130z"
    } ],
    [ "path", {
      fill: "#009246",
      d: "M-60,45h40v-90h-40z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-20,45h40v-90h-40z"
    } ],
    [ "path", {
      fill: "#ce2b37",
      d: "M20,45h40v-90h-40z"
    } ]
  ] ],
  "flag-de": [ "g", {
    stroke: "none"
  }, [
    [ "path", {
      fill: "#000",
      d: "M-65,41h130v-82h-130z"
    } ],
    [ "path", {
      fill: "#ffce00",
      d: "M-60,36h120v-24h-120z"
    } ],
    [ "path", {
      fill: "#dd0000",
      d: "M-60,12h120v-24h-120z"
    } ]
  ] ],
  "flag-en": [ "g", {
    stroke: "none"
  }, [
    [ "path", {
      fill: "#000",
      d: "M-65,37h130v-75h-130z"
    } ],
    [ "path", {
      fill: "#bb133e",
      d: "M-60,32h120v-65h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,22h120v5h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,12h120v5h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,2h120v5h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,-8h120v5h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,-18h120v5h-120z"
    } ],
    [ "path", {
      fill: "#fff",
      d: "M-60,-28h120v5h-120z"
    } ],
    [ "path", {
      fill: "#002664",
      d: "M-60,-33h48v35h-48z"
    } ],

  ] ],
  font: path2('M25,-20H40V40H45V45H25V40H30V25H10L3,40H10V45H-10V40H-5L25,-20M30,-15L13,20H30V-15M-35,-45H-10C-4,-45,0,-41,0,-35V20H-15V-5H-30V20H-45V-35C-45,-41,-41,-45,-35,-45M-30,-35V-15H-15V-35H-30Z'),
  'format-align-center': path2('M-45,-45H45V-35H-45V-45M-25,-25H25V-15H-25V-25M-45,-5H45V5H-45V-5M-25,15H25V25H-25V15M-45,35H45V45H-45V35Z'),
  'format-align-justify': path2('M-45,-45H45V-35H-45V-45M-45,-25H45V-15H-45V-25M-45,-5H45V5H-45V-5M-45,15H45V25H-45V15M-45,35H45V45H-45V35Z' ),
  'format-align-left': path2('M-45,-45H45V-35H-45V-45M-45,-25H15V-15H-45V-25M-45,-5H45V5H-45V-5M-45,15H15V25H-45V15M-45,35H45V45H-45V35Z' ),
  'format-align-right': path2(' M-45,-45H45V-35H-45V-45M-15,-25H45V-15H-15V-25M-45,-5H45V5H-45V-5M-15,15H45V25H-15V15M-45,35H45V45H-45V35Z ' ),
  'format-bold': path2('M8,18H-10V3H8A8,8,0,0,1,15,10A8,8,0,0,1,8,18M-10,-27H5A8,8,0,0,1,13,-20A8,8,0,0,1,5,-12H-10M18,-6C23,-9,26,-15,26,-20C26,-31,18,-40,6,-40H-25V30H10C21,30,29,22,29,11C29,3,24,-3,18,-6Z'),
  'format-italic': path2( 'M-10,-40V-25H1L-16,15H-30V30H10V15H-1L16,-25H30V-40H-10Z' ),
  'format-float-center': path2('M-15,-25H15V5H-15V-25M-45,-45H45V-35H-45V-45M-45,15H45V25H-45V15M-45,35H25V45H-45V35Z'),
  'format-float-left': path2('M-45,-25H-15V5H-45V-25M-45,-45H45V-35H-45V-45M45,-25V-15H-5V-25H45M45,-5V5H-5V-5H45M-45,15H25V25H-45V15M-45,35H45V45H-45V35Z'),
  'format-float-none': path2('M-45,-25H-15V5H-45V-25M-45,-45H45V-35H-45V-45M45,-5V5H-5V-5H45M-45,15H25V25H-45V15M-45,35H45V45H-45V35Z'),
  'format-float-right': path2('M15,-25H45V5H15V-25M-45,-45H45V-35H-45V-45M5,-25V-15H-45V-25H5M-15,-5V5H-45V-5H-15M-45,15H25V25H-45V15M-45,35H45V45H-45V35Z'),
  'format-header': path2('M-40,-40H-30V-10H-10V-40H0V30H-10V0H-30V30H-40V-40M13,-23L31,-5L13,13L20,20L45,-5L20,-30L13,-23Z'),
  'format-underline': path2(
    'M-35,45H35V35H-35V45M0,25A30,30,0,0,0,30,-5V-45H18V-5A18,18,0,0,1,0,13A18,18,0,0,1,-17,-5V-45H-30V-5A30,30,0,0,0,0,25Z'
  ),
  fullscreen: path2('M-35,-35H-10V-25H-25V-10H-35V-35M10,-35H35V-10H25V-25H10V-35M25,10H35V35H10V25H25V10M-10,25V35H-35V10H-25V25H-10Z'),
  gear: path2(
    'M0,18A18,18,0,0,1,-17,0A18,18,0,0,1,0,-17A18,18,0,0,1,18,0A18,18,0,0,1,0,18M37,5C37,3,38,2,38,0C38,-2,37,-3,37,-5L48,-13C49,-14,49,-15,48,-16L38,-34C38,-35,36,-35,35,-35L23,-30C20,-32,18,-33,14,-35L13,-48C12,-49,11,-50,10,-50H-10C-11,-50,-12,-49,-12,-48L-14,-35C-17,-33,-20,-32,-23,-30L-35,-35C-36,-35,-38,-35,-38,-34L-48,-16C-49,-15,-49,-14,-48,-13L-37,-5C-37,-3,-37,-2,-37,0C-37,2,-37,3,-37,5L-48,13C-49,14,-49,15,-48,16L-38,34C-38,35,-36,35,-35,35L-23,30C-20,32,-17,33,-14,35L-12,48C-12,49,-11,50,-10,50H10C11,50,12,49,13,48L14,35C18,33,20,32,23,30L35,35C36,35,38,35,38,34L48,16C49,15,49,14,48,13L37,5Z'
  ),
  gps: path2(
    'M0,-20A20,20,0,0,1,20,0A20,20,0,0,1,0,20A20,20,0,0,1,-20,0A20,20,0,0,1,0,-20M-45,5H-55V-5H-45C-42,-26,-26,-42,-5,-45V-55H5V-45C26,-42,43,-26,45,-5H55V5H45C43,26,26,43,5,45V55H-5V45C-26,43,-42,26,-45,5M0,-35A35,35,0,0,0,-35,0A35,35,0,0,0,0,35A35,35,0,0,0,35,0A35,35,0,0,0,0,-35Z'
  ),
  hand: path2(
    "M-10,-50A10,10,0,0,1,0,-40V-17C0,-17,10,-19,10,-14C10,-14,20,-15,20,-10C20,-10,30,-11,30,-6C30,-6,40,-7,40,-2V15C40,20,25,45,25,50H-15C-15,50,-25,15,-40,5C-40,5,-45,-25,-20,0V-40A10,10,0,0,1,-10,-50Z"
  ),
  heart: path2('M0,47L-7,40C-33,17,-50,1,-50,-17C-50,-33,-38,-45,-22,-45C-14,-45,-5,-41,0,-35C5,-41,14,-45,23,-45C38,-45,50,-33,50,-17C50,1,33,17,7,40L0,47Z'),
  hide: path2(
    'M-1,-15L15,1C15,1,15,0,15,0A15,15,0,0,0,0,-15C0,-15,-1,-15,-1,-15M-22,-11L-15,-3C-15,-2,-15,-1,-15,0A15,15,0,0,0,0,15C1,15,2,15,3,15L11,22C8,24,4,25,0,25A25,25,0,0,1,-25,0C-25,-4,-24,-8,-22,-11M-50,-39L-39,-27L-36,-25C-45,-18,-51,-10,-55,0C-46,22,-25,38,0,38C8,38,15,36,22,33L24,35L39,50L45,44L-44,-45M0,-25A25,25,0,0,1,25,0C25,3,24,6,23,9L38,24C45,18,51,9,55,0C46,-22,25,-37,0,-37C-7,-37,-14,-36,-20,-34L-9,-23C-6,-24,-3,-25,0,-25Z'
  ),
  home: path2( 'M-10,40V10H10V40H35V0H50L0,-45L-50,0H-35V40H-10Z' ),
  image: path2('M5,-15H33L5,-42V-15M-30,-50H10L40,-20V40A10,10,0,0,1,30,50H-30C-36,50,-40,46,-40,40V-40C-40,-46,-36,-50,-30,-50M-30,40H15L30,40V0L10,20L0,10L-30,40M-20,-15A10,10,0,0,0,-30,-5A10,10,0,0,0,-20,5A10,10,0,0,0,-10,-5A10,10,0,0,0,-20,-15Z'),
  import: path2( 'M-15,20V-10H-35L0,-45L35,-10H15V20H-15M-35,40V30H35V40H-35Z' ),
  improvement: path2("M0,50A50,50,0,0,1,-50,0A50,50,0,0,1,0,-50A50,50,0,0,1,50,0A50,50,0,0,1,0,50M0,-25L-25,0H-10V20H10V0H25L0,-25Z"),
  left: draw( 'M30,-30L-30,0,30,30' ),
  'left-double': draw( 'M-10,-30L-40,0,-10,30M40,-30L10,0,40,30' ),
  link: path2('M-7,7C-5,9,-5,12,-7,14C-9,16,-12,16,-14,14C-24,4,-24,-11,-14,-21V-21L4,-39C13,-49,29,-49,39,-39C49,-29,49,-13,39,-4L31,4C32,0,31,-4,29,-8L32,-11C38,-16,38,-26,32,-32C26,-38,16,-38,11,-32L-7,-14C-13,-8,-13,1,-7,7M7,-14C9,-16,12,-16,14,-14C24,-4,24,11,14,21V21L-4,39C-13,49,-29,49,-39,39C-49,29,-49,13,-39,4L-31,-4C-31,0,-31,4,-29,8L-32,11C-38,16,-38,26,-32,32C-26,38,-16,38,-11,32L7,14C13,8,13,-1,7,-7C5,-9,5,-12,7,-14Z'),
  location: path2('M0,-2A13,13,0,0,1,-12,-15A13,13,0,0,1,0,-27A13,13,0,0,1,13,-15A13,13,0,0,1,0,-2M0,-50A35,35,0,0,0,-35,-15C-35,11,0,50,0,50C0,50,35,11,35,-15A35,35,0,0,0,0,-50Z'),
  logout: path2(
    "M25,26V10H-10V-10H25V-26L51,0L25,26M5,-50A10,10,0,0,1,15,-40V-20H5V-40H-40V40H5V20H15V40A10,10,0,0,1,5,50H-40A10,10,0,0,1,-50,40V-40A10,10,0,0,1,-40,-50H5Z"
  ),
  mail: path2(
    'M40,-40H-40A10,10,0,0,0,-50,-30V30A10,10,0,0,0,-40,40H40A10,10,0,0,0,50,30V-30A10,10,0,0,0,40,-40M40,30H-40V-20L0,5L40,-20V30M40,-30L0,-5L-40,-30V-30H40V-30Z'
  ),
  "map-layer": path2( 'M0,20L37,-9L45,-15L0,-50L-45,-15L-37,-9M0,33L-37,4L-45,10L0,45L45,10L37,4L0,33Z' ),
  menu: path2('M-45,-30H45V-20H-45V-30M-45,-5H45V5H-45V-5M-45,20H45V30H-45V20Z'),
  minus: draw( "M-45,0H45" ),
  "minus-o": [ "g", [
    [ "circle", {
      r: 60,
      stroke: "none",
      fill: 0
    } ],
    [ "circle", {
      r: 50,
      stroke: "none",
      fill: 1
    } ],
    [ "path", {
      d: "M-30,0H30",
      fill: "none",
      stroke: 0,
      "stroke-width": 16
    } ]
  ] ],
  "minus-small": draw( "M-30,0H30" ),
  ok: [ 'g', [
    [ 'path', {
      d: 'M-30,0L-10,30,30,-30',
      stroke: 1,
      'stroke-width': 30
    } ],
    [ 'path', {
      d: 'M-30,0L-10,30,30,-30',
      stroke: 0,
      'stroke-width': 16
    } ]
  ] ],
  plus: draw( "M-45,0H45M0,-45V45" ),
  "plus-o": [ "g", [
    [ "circle", {
      r: 60,
      stroke: "none",
      fill: 0
    } ],
    [ "circle", {
      r: 50,
      stroke: "none",
      fill: 1
    } ],
    [ "path", {
      d: "M-30,0H30M0,-30V30",
      fill: "none",
      stroke: 0,
      "stroke-width": 16
    } ]
  ] ],
  "plus-small": draw( "M-30,0H30M0,-30V30" ),
  print: [ 'path', {
    fill: 0,
    d: 'M30,-45H-30V-25H30M35,0A5,5,0,0,1,30,-5A5,5,0,0,1,35,-10A5,5,0,0,1,40,-5A5,5,0,0,1,35,0M20,35H-20V10H20M35,-20H-35A15,15,0,0,0,-50,-5V25H-30V45H30V25H50V-5A15,15,0,0,0,35,-20Z'
  } ],
  question: path2("M-10,35H5V50H-10V35M0,-50C27,-49,38,-22,23,-2C18,3,12,7,8,11C5,15,5,20,5,25H-10C-10,17,-10,10,-7,5C-3,0,3,-3,8,-7C20,-18,17,-34,0,-35A15,15,0,0,0,-15,-20H-30A30,30,0,0,1,0,-50Z"),
  redo: path2('M32,-7C23,-15,11,-20,-2,-20C-26,-20,-45,-5,-52,16L-40,20C-35,4,-20,-7,-2,-7C7,-7,16,-4,23,2L5,20H50V-25L32,-7Z'),
  refresh: path2('M28,-28C21,-35,11,-40,0,-40A40,40,0,0,0,-40,0A40,40,0,0,0,0,40C19,40,34,27,39,10H28C24,22,13,30,0,30A30,30,0,0,1,-30,0A30,30,0,0,1,0,-30C8,-30,16,-27,21,-21L5,-5H40V-40L28,-28Z'),
  right: draw( 'M-30,-30L30,0,-30,30' ),
  'right-double': draw( 'M10,-30L40,0,10,30M-40,-30L-10,0,-40,30' ),
  search: path2('M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'),
  select: path2('M35,35H-35V-35H15V-45H-35C-41,-45,-45,-41,-45,-35V35A10,10,0,0,0,-35,45H35A10,10,0,0,0,45,35V-5H35M-20,-10L-27,-2L-5,20L45,-30L38,-37L-5,6L-20,-10Z'),
  unselect: path2('M35,-45H-35C-41,-45,-45,-41,-45,-35V35A10,10,0,0,0,-35,45H35A10,10,0,0,0,45,35V-35C45,-41,41,-45,35,-45M35,-35V35H-35V-35H35Z'),
  share: path2('M30,20C26,20,23,22,20,24L-15,3C-15,2,-15,1,-15,0C-15,-1,-15,-2,-15,-3L20,-24C23,-22,26,-20,30,-20A15,15,0,0,0,45,-35A15,15,0,0,0,30,-50A15,15,0,0,0,15,-35C15,-34,15,-33,15,-31L-20,-11C-22,-13,-26,-15,-30,-15A15,15,0,0,0,-45,0A15,15,0,0,0,-30,15C-26,15,-22,13,-20,11L16,32C16,33,15,34,15,35C15,43,22,50,30,50C38,50,45,43,45,35A15,15,0,0,0,30,20Z'),
  show: path2('M0,-15A15,15,0,0,0,-15,0A15,15,0,0,0,0,15A15,15,0,0,0,15,0A15,15,0,0,0,0,-15M0,25A25,25,0,0,1,-25,0A25,25,0,0,1,0,-25A25,25,0,0,1,25,0A25,25,0,0,1,0,25M0,-37C-25,-37,-46,-22,-55,0C-46,22,-25,38,0,38C25,38,46,22,55,0C46,-22,25,-37,0,-37Z'),
  speaker: path2('M40,35L33,28C41,21,45,11,45,0C45,-11,41,-21,33,-28L40,-35C49,-26,55,-14,55,0C55,14,49,26,40,35M26,21L19,14C23,11,25,6,25,0C25,-6,23,-11,19,-14L26,-21C32,-16,35,-8,35,0C35,8,32,16,26,21M-40,-45H0A10,10,0,0,1,10,-35V35A10,10,0,0,1,0,45H-40A10,10,0,0,1,-50,35V-35A10,10,0,0,1,-40,-45M-20,-35A10,10,0,0,0,-30,-25A10,10,0,0,0,-20,-15A10,10,0,0,0,-10,-25A10,10,0,0,0,-20,-35M-20,-5A20,20,0,0,0,-40,15A20,20,0,0,0,-20,35A20,20,0,0,0,0,15A20,20,0,0,0,-20,-5M-20,5A10,10,0,0,1,-10,15A10,10,0,0,1,-20,25A10,10,0,0,1,-30,15A10,10,0,0,1,-20,5Z'),
  star: path2('M0,26L31,45L23,10L50,-14L14,-17L0,-50L-14,-17L-50,-14L-23,10L-31,45L0,26Z'),
  'tri-down': [ 'g', [
    [ 'path', {
      d: 'M-30,-30L0,30,30,-30Z',
      stroke: 0,
      fill: 1,
      'stroke-width': 8
    } ]
  ] ],
  'tri-left': [ 'g', [
    [ 'path', {
      d: 'M30,-30L-30,0,30,30Z',
      stroke: 0,
      fill: 1,
      'stroke-width': 8
    } ]
  ] ],
  'tri-right': [ 'g', [
    [ 'path', {
      d: 'M-30,-30L30,0,-30,30Z',
      stroke: 0,
      fill: 1,
      'stroke-width': 8
    } ]
  ] ],
  'tri-up': [ 'g', [
    [ 'path', {
      d: 'M-30,30L0,-30,30,30Z',
      stroke: 0,
      fill: 1,
      'stroke-width': 8
    } ]
  ] ],
  twitter: path2('M52,-30C48,-28,44,-27,40,-27C44,-29,48,-33,49,-38C45,-36,41,-34,36,-33C32,-37,26,-40,20,-40C8,-40,-1,-30,-1,-19C-1,-17,-1,-15,-1,-14C-19,-15,-34,-23,-45,-36C-47,-33,-48,-29,-48,-25C-48,-18,-44,-11,-38,-7C-42,-7,-45,-8,-48,-10C-48,-10,-48,-10,-48,-10C-48,1,-41,9,-31,11C-33,12,-35,12,-37,12C-38,12,-39,12,-41,12C-38,20,-30,26,-21,26C-28,32,-37,36,-47,36C-49,36,-51,36,-52,35C-43,41,-31,45,-19,45C20,45,42,12,42,-16C42,-17,42,-18,42,-19C46,-22,49,-26,52,-30Z'),
  undo: path2('M3,-20C-11,-20,-23,-15,-32,-7L-50,-25V20H-5L-23,2C-16,-4,-7,-7,3,-7C20,-7,35,4,41,20L52,16C45,-5,26,-20,3,-20Z'),
  up: draw( 'M-30,30L0,-30,30,30' ),
  'up-double': draw( 'M-30,40L0,10,30,40M-30,-10L0,-40,30,-10' ),
  user: path2(
    'M0,-40A20,20,0,0,1,20,-20A20,20,0,0,1,0,0A20,20,0,0,1,-20,-20A20,20,0,0,1,0,-40M0,10C22,10,40,19,40,30V40H-40V30C-40,19,-22,10,0,10Z'
  ),
  wait: [ 'g', [
    [ 'path', {
      d: "M0,40 A40,40,0,1,1,40,0",
      stroke: 0,
      'stroke-width': 40
    } ],
    [ 'path', {
      d: "M0,40 A40,40,0,1,1,40,0",
      stroke: 1,
      'stroke-width': 24
    } ]
  ] ],
  "zoom-in": [ "g", [
    path2(
      'M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'
    ),
    path2( 'M-50,42h10v-10h4v10h10v4h-10v10h-4v-10h-10Z' )
  ] ],
  "zoom-out": [ "g", [
    path2(
      'M-12,-45A33,33,0,0,1,20,-12C20,-4,17,3,12,9L14,10H18L43,35L35,43L10,18V14L9,12C3,17,-4,20,-12,20A33,33,0,0,1,-45,-12A33,33,0,0,1,-12,-45M-12,-35C-25,-35,-35,-25,-35,-12C-35,0,-25,10,-12,10C0,10,10,0,10,-12C10,-25,0,-35,-12,-35Z'
    ),
    path2( 'M-50,42h24v4h-32Z' )
  ] ]
};

// Synonyms.
Icon.Icons.add = Icon.Icons.plus;
Icon.Icons.back = Icon.Icons.left;
Icon.Icons.help = Icon.Icons.question;
Icon.Icons.save = Icon.Icons.export;


Icon.draw = draw;
Icon.path2 = path2;

/**
 * You can register more icons with this function.
 */
Icon.register = function ( icons ) {
  var key, val;
  for ( key in icons ) {
    val = icons[ key ];
    Icon.Icons[ key ] = val;
  }

};


module.exports = Icon;
