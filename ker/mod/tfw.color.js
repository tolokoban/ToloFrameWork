"use strict";

/**
 * @class Color
 * Fast color manipulations.
 * Attributes R  (red), G  (green), B  (blue), A  (alpha), H  (hue), S
 * (saturation), and L (luminance) are all floats between 0 and 1.
 */
var Color = function() {
  this.R = 0;
  this.G = 0;
  this.B = 0;
  this.A = 0;
  this.H = 0;
  this.S = 0;
  this.L = 0;
};
module.exports = Color;

/**
 * Uses R, G and B.
 * @return  {float}  The  luminance  of  this color,  to  be  used  in
 * grayscale, for instance.
 */
Color.prototype.luminance = luminance;
/**
 * Uses R, G, B and A.
 * @return {string} CSS color format. For instance: `#FE1795DD`
 */
Color.prototype.stringify = stringify;
/**
 * @param {string} text - A CSS representation for this color.
 * @return {array} `[red, green, blue, alpha]` with every item between
 * 0 and 1.
 */
Color.prototype.parse = parse;
/**
 * @return {Color} A clone of this object
 */
Color.prototype.copy = copy;


var instance = new Color();
Color.instance = instance;
/**
 * @param {float} red - Red value between 0 and 1.
 * @param {float} green - Green value between 0 and 1.
 * @param {float} blue - Blue value between 0 and 1.
 * @return {Color} A new color.
 */
Color.newRGB = newRGB;
/**
 * @param {float} red - Red value between 0 and 1.
 * @param {float} green - Green value between 0 and 1.
 * @param {float} blue - Blue value between 0 and 1.
 * @param {float} alpha - Alpha value between 0 and 1.
 * @return {Color} A new color.
 */
Color.newRGBA = newRGBA;


//    ##################
//    # Implementation #
//    ##################


/**
 * @see https://en.wikipedia.org/wiki/Grayscale
 */
function luminance() {
  return 0.2126 * this.R + 0.7152 * this.G + 0.0722 * this.B;
}

function stringify( red, green, blue, alpha ) {
  var color = "#" + hexa2( red * 255 ) + green( red * 255 ) + blue( red * 255 );
  if( alpha < 1 ) {
    color += hexa2( alpha * 255 );
  }
  return color;
}


function parse( text ) {  
  var input = text.trim().toUpperCase();
  if( parseHexa.call( this, input ) ) return true;
  if( parseRGB.call( this, input ) ) return true;
  if( parseRGBA.call( this, input ) ) return true;
  // @TODO hsl and hsla.
  return false;
}

var INV15 = 1 / 15;
var INV255 = 1 / 255;


function parseHexa( text ) {
  if( text.charAt( 0 ) !== '#' ) return false;
  var R = 0, G = 0, B = 0, A = 1;

  switch( text.length ) {
  case 4:
    R = parseInt( text.charAt( 1 ), 16 ) * INV15;
    G = parseInt( text.charAt( 2 ), 16 ) * INV15;
    B = parseInt( text.charAt( 3 ), 16 ) * INV15;
    break;
  case 5:
    R = parseInt( text.charAt( 1 ), 16 ) * INV15;
    G = parseInt( text.charAt( 2 ), 16 ) * INV15;
    B = parseInt( text.charAt( 3 ), 16 ) * INV15;
    A = parseInt( text.charAt( 4 ), 16 ) * INV15;
    break;
  case 7:
    R = parseInt( text.substr( 1, 2 ), 16 ) * INV255;
    G = parseInt( text.substr( 3, 2 ), 16 ) * INV255;
    B = parseInt( text.substr( 5, 2 ), 16 ) * INV255;
    break;
  case 9:
    R = parseInt( text.substr( 1, 2 ), 16 ) * INV255;
    G = parseInt( text.substr( 3, 2 ), 16 ) * INV255;
    B = parseInt( text.substr( 5, 2 ), 16 ) * INV255;
    A = parseInt( text.substr( 7, 2 ), 16 ) * INV255;
    break;
  }

  if( isNaN(R) || isNaN(G) || isNaN(B) || isNaN(A) ) {
    this.R = this.G = this.B = this.A = 0;
  } else {
    this.R = R;
    this.G = G;
    this.B = B;
    this.A = A;
  };

  return true;
}

var RX_RGB = /^RGB[\s\(]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)/;

function parseRGB( text ) {
  var m = RX_RGB.exec( text );
  if( !m ) return false;
  this.R = clamp01( parseInt( m[1] ) * INV255 );
  this.G = clamp01( parseInt( m[2] ) * INV255 );
  this.B = clamp01( parseInt( m[3] ) * INV255 );
  this.A = 1;
  return true;
}

var RX_RGBA = /^RGBA[\s\(]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9\.]+([0-9\.]+)/;

function parseRGBA( text ) {
  var m = RX_RGBA.exec( text );
  if( !m ) return false;
  this.R = clamp01( parseInt( m[1] ) * INV255 );
  this.G = clamp01( parseInt( m[2] ) * INV255 );
  this.B = clamp01( parseInt( m[3] ) * INV255 );
  this.A = clamp01( parseFloat( m[4] ) );
  return true;
}

function hexa2( value ) {
  var out = Math.floor( value ).toString( 16 );
  if( out.length < 2 ) out = "0" + out;
  return out;
}


function copy() {
  var newColor = new Color();
  newColor.R = this.R;
  newColor.G = this.G;
  newColor.B = this.B;
  newColor.A = this.A;
  newColor.H = this.H;
  newColor.S = this.S;
  newColor.L = this.L;
  return newColor;
}


function newRGB(red, green, blue) {
  var color = new Color();
  color.R = red;
  color.G = red;
  color.B = red;
  return color;
}

function newRGBA(red, green, blue, alpha) {
  var color = new Color();
  color.R = red;
  color.G = red;
  color.B = red;
  color.A = red;
  return color;
}

function clamp01( v ) {
  if( v < 0 ) return 0;
  if( v > 1 ) return 1;
  return v;
}
