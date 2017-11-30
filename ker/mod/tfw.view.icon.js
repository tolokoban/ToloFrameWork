"use strict";

var $ = require( "dom" );
var Icons = require("tfw.icons");


// Code behind to use in the XJS.
var CODE_BEHIND = {
  onContentChanged: onContentChanged,
  onPen0Changed: function(v) { updatePen.call( this, 0, v ); },
  onPen1Changed: function(v) { updatePen.call( this, 1, v ); },
  onPen2Changed: function(v) { updatePen.call( this, 2, v ); },
  onPen3Changed: function(v) { updatePen.call( this, 3, v ); },
  onPen4Changed: function(v) { updatePen.call( this, 4, v ); },
  onPen5Changed: function(v) { updatePen.call( this, 5, v ); },
  onPen6Changed: function(v) { updatePen.call( this, 6, v ); },
  onPen7Changed: function(v) { updatePen.call( this, 7, v ); }  
};


function onContentChanged( content ) {
  if( typeof content === 'string' ) {
    content = Icons.iconsBook[content];
    if( typeof content === 'undefined' ) content = Icons.iconsBook.question;
  }

  this._content = createSvgFromDefinition.call( this, content );
  $.clear( this, this._content.svgRootGroup );

  // Update pens' colors.
  [0,1,2,3,4,5,6,7].forEach(function (penIndex) {
    updatePen.call( this, penIndex, this["pen" + penIndex] );
  }, this);

}

// Special colors.
// 0 is black,  1 is white, P  is primary, S is secondary,  L is light
// and D is dark.
var FILL_COLORS_TO_CLASSES = {
  '0': "fill0",
  '1': "fill1",
  P:   "thm-svg-fill-P",
  PL:  "thm-svg-fill-PL",
  PD:  "thm-svg-fill-PD",
  S:   "thm-svg-fill-S",
  SL:  "thm-svg-fill-SL",
  SD:  "thm-svg-fill-SD"
};
var STROKE_COLORS_TO_CLASSES = {
  '0': "stroke0",
  '1': "stroke1",
  P:    "thm-svg-stroke-P",
  PL:   "thm-svg-stroke-PL",
  PD:   "thm-svg-stroke-PD",
  S:    "thm-svg-stroke-S",
  SL:   "thm-svg-stroke-SL",
  SD:   "thm-svg-stroke-SD"
};


function createSvgFromDefinition( def ) {
  var svgParent = $.svg( 'g', {
    'stroke-width': 6,
    fill: "none",
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  } );

  // Store elements with special colors  in order to update them later
  // if needed. We can have up to 8 colors numbered from 0 to 5.
  var elementsToFillPerColor = [[], [], [], [], [], [], [], []];
  var elementsToStrokePerColor = [[], [], [], [], [], [], [], []];

  var svgRootGroup = addChild( this.$, elementsToFillPerColor, elementsToStrokePerColor, def );
  $.att( svgRootGroup, {
    'stroke-width': 6,
    fill: "none",
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
  
  return {
    svgRootGroup: svgRootGroup,
    elementsToFillPerColor: elementsToFillPerColor,
    elementsToStrokePerColor: elementsToStrokePerColor
  };
}

/**
 * @param {Node} parent - SVG element into append elements created from `def`.
 * @param {string} def - Text to add to the `parent`.
 * @param {array} def - SVG node to add to `parent`.
 * @param {string} def[0] - Tag name of then SVG node to add to `parent`.
 * @param {array} def[>0] - Definition of the children.
 * @param {object} def[>0] - Attributes of the element.
 */
function addChild( parent, elementsToFillPerColor, elementsToStrokePerColor, def ) {
  if( typeof def === 'string' )
    return $.add( parent, def );
  checkDefinitionSyntax( def );
  var elementName = def[0];
  var element = $.svg( elementName );

  def.forEach(function (childItem, index) {
    if( index === 0 ) return;
    if( Array.isArray( childItem ) ) {
      childItem.forEach( addChild.bind( null, element, elementsToFillPerColor, elementsToStrokePerColor ) );
    } else {
      setAttributesAndRegisterElementsWithSpecialColors(
        element, elementsToFillPerColor, elementsToStrokePerColor, childItem );
    }
  });

  $.add( parent, element );
  return element;
}

function setAttributesAndRegisterElementsWithSpecialColors(
  node, elementsToFillPerColor, elementsToStrokePerColor, attribs ) {
  var attName, attValue, valueAsIndex, elementsPerColor;

  for( attName in attribs ) {
    attValue = attribs[attName];
    if( attName === 'fill' || attName === 'stroke' ) {
      valueAsIndex = parseInt( attValue );
      if( isNaN( valueAsIndex ) ) {
        // Straigth attribute.
        $.att( node, attName, attValue );
      } else {
        elementsPerColor = attName === 'fill' ? elementsToFillPerColor : elementsToStrokePerColor;
        valueAsIndex = clamp(valueAsIndex, 0, elementsPerColor.length - 1 );
        elementsPerColor[ valueAsIndex ].push( node );
      }
    } else {
      $.att( node, attName, attValue );
    }
  }
}

function checkDefinitionSyntax( def ) {
  if( !Array.isArray( def ) ) {
    throw "Definition of SVG elements must be arrays!\n"
      + JSON.stringify( def );
  }
  var svgElementTagName = def[0];
  if( typeof svgElementTagName !== 'string' )
    throw "The first item of a SVG element must be a string!\n" + svgElementTagName;
}

function updatePen( penIndex, penColor ) {
  var elementsToFill = this._content.elementsToFillPerColor[penIndex];
  if( !Array.isArray(elementsToFill) ) elementsToFill = [];
  var elementsToStroke = this._content.elementsToStrokePerColor[penIndex];
  if( !Array.isArray(elementsToStroke) ) elementsToStroke = [];

  updateColor( elementsToFill, elementsToStroke, penColor );
}

function updateColor( elementsToFill, elementsToStroke, color ) {
  updateColorForType( "fill", elementsToFill, FILL_COLORS_TO_CLASSES, color );
  updateColorForType( "stroke", elementsToStroke, STROKE_COLORS_TO_CLASSES, color );
}

function updateColorForType( attName, elements, classes, color ) {
  var className = classes[color];
  if( typeof className === 'undefined' ) {
    elements.forEach(function (element) {
      $.att( element, attName, color );
    });
  } else {
    elements.forEach(function (element) {
      Object.values( classes ).forEach(function (classNameToRemove) {
        $.removeClass( element, classNameToRemove );
      });
      $.addClass( element, className );
      $.removeAtt( element, attName );
    });
  }
}

function clamp( value, min, max ) {
  if( value < min ) return min;
  if( value > max ) return max;
  return value;
}
