"use strict";

var $ = require( "dom" );
var Icons = require("tfw.icons");


function createSvgFromDefinition( def ) {
  var svg = $.svgRoot( 'wdg-icon', {
    width: '100%',
    height: '100%',
    viewBox: '-65 -65 130 130',
    preserveAspectRatio: "xMidYMid meet"
  } );
  var g = $.svg( 'g', {
    'stroke-width': 6,
    fill: "none",
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  } );
  $.add( svg, g );

  return svg;
}


// Special colors.
// 0 is black,  1 is white, P  is primary, S is secondary,  L is light
// and D is dark.
var ENUM = ['0', '1', 'P', 'PL', 'PD', 'S', 'SL', 'SD'];

/**
 * 
 */
function updateColor( svg, index, color ) {
  
}
