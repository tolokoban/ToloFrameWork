"use strict";

/**
 * @class Color
 * Fast color manipulations.
 * Attributes R  (red), G  (green), B  (blue), A  (alpha), H  (hue), S
 * (saturation), and L (luminance) are all floats between 0 and 1.
 */
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

/**
 * Read H,S,L and write R,G,B.
 */
Color.prototype.hsl2rgb = hsl2rgb;

/**
 * Read R,G,B and write H,S,L.
 */
Color.prototype.rgb2hsl = rgb2hsl;

const INSTANCE = new Color();
Color.instance = INSTANCE;
Color.parse = staticParse;
Color.luminance = staticLuminance;

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


/*
 *    ##################
 *    # Implementation #
 *    ##################
 */

/**
 * @constructor
 * @param {string} code - CSS color code.
 */
function Color( code ) {
    this.R = 0;
    this.G = 0;
    this.B = 0;
    this.A = 0;
    this.H = 0;
    this.S = 0;
    this.L = 0;

    if ( typeof code === 'string' ) {
        this.parse( code );
    }
}

const
    INV6 = 1 / 6,
    INV15 = 1 / 15,
    INV99 = 1 / 99,
    INV255 = 1 / 255,
    INV359 = 1 / 359;

/**
 * Read R,G,B and write H,S,L.
 * @this Color
 * @returns {undefined}
 */
function rgb2hsl() {
    const
        R = this.R,
        G = this.G,
        B = this.B,
        min = Math.min( R, G, B ),
        max = Math.max( R, G, B ),
        delta = max - min;

    this.L = 0.5 * ( max + min );

    if ( delta < 0.000001 ) {
        this.H = 0;
        this.S = 0;
    } else {
        this.S = delta / ( 1 - Math.abs( ( 2 * this.L ) - 1 ) );
        if ( max === R ) {
            if ( G >= B ) {
                this.H = INV6 * ( ( G - B ) / delta );
            } else {
                this.H = 1 - ( INV6 * ( ( B - G ) / delta ) );
            }
        } else if ( max === G ) {
            this.H = INV6 * ( 2 + ( ( B - R ) / delta ) );
        } else {
            this.H = INV6 * ( 4 + ( ( R - G ) / delta ) );
        }
    }
}

/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
 * @this Color
 * @returns {undefined}
 */
function hsl2rgb() {
    const
        H = 6 * this.H,
        S = this.S,
        L = this.L,
        chroma = ( 1 - Math.abs( 2 * L - 1 ) ) * S,
        x = chroma * ( 1 - Math.abs( H % 2 - 1 ) );

    let
        R = 0,
        G = 0,
        B = 0;

    if ( H < 3 ) {
        if ( H < 1 ) {
            R = chroma;
            G = x;
            B = 0;
        } else if ( H < 2 ) {
            R = x;
            G = chroma;
            B = 0;
        } else {
            // H == 2.
            R = 0;
            G = chroma;
            B = x;
        }
    } else if ( H < 4 ) {
        R = 0;
        G = x;
        B = chroma;
    } else if ( H < 5 ) {
        R = x;
        G = 0;
        B = chroma;
    } else {
        R = chroma;
        G = 0;
        B = x;
    }

    const shift = L - chroma * 0.5;
    this.R = R + shift;
    this.G = G + shift;
    this.B = B + shift;
}

/**
 * @see https://en.wikipedia.org/wiki/Grayscale
 * @this Color
 * @returns {undefined}
 */
function luminance() {
    return ( 0.2126 * this.R ) + ( 0.7152 * this.G ) + ( 0.0722 * this.B );
}

/**
 * @this Color
 * @returns {string} String value of the color. `#fd45a7`.
 */
function stringify() {
    let color = hexa2( this.R * 255 ) + hexa2( this.G * 255 ) + hexa2( this.B * 255 );
    if ( this.A < 1 ) {
        color += hexa2( this.A * 255 );
    }
    return `#${color}`;
}


/**
 * @this Color
 * @param {string} _text - CSS color code.
 * @returns {boolean} Success?
 */
function parse( _text ) {
    const
        text = typeof _text !== 'undefined' ? _text : '#000000',
        input = text.trim().toUpperCase();
    if ( parseHexa.call( this, input ) ) return true;
    if ( parseRGB.call( this, input ) ) return true;
    if ( parseRGBA.call( this, input ) ) return true;
    if ( parseHSL.call( this, input ) ) return true;
    // @TODO hsl and hsla.
    return false;
}


/**
 * @this Color
 * @param {string} text - CSS color code.
 * @returns {boolean} Success?
 */
function parseHexa( text ) {
    if ( text.charAt( 0 ) !== '#' ) return false;
    let
        R = 0,
        G = 0,
        B = 0,
        A = 1;

    switch ( text.length ) {
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
    default:
    }

    if ( isNaN( R ) || isNaN( G ) || isNaN( B ) || isNaN( A ) ) {
        this.R = this.G = this.B = this.A = 0;
    } else {
        this.R = R;
        this.G = G;
        this.B = B;
        this.A = A;
    }

    return true;
}

const RX_RGB = /^RGB[\s\(]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)/;

/**
 * @this Color
 * @param   {string} text - `rgb(200, 140, 50)`
 * @returns {boolean} `true` if `text` is a valid `rgb()` syntax.
 */
function parseRGB( text ) {
    const m = RX_RGB.exec( text );
    if ( !m ) return false;
    this.R = clamp01( parseInt( m[ 1 ], 10 ) * INV255 );
    this.G = clamp01( parseInt( m[ 2 ], 10 ) * INV255 );
    this.B = clamp01( parseInt( m[ 3 ], 10 ) * INV255 );
    this.A = 1;
    return true;
}

const RX_RGBA = /^RGBA[\s\(]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9\.]+([0-9\.]+)/;

/**
 * @this Color
 * @param   {string} text - `rgba(200, 140, 50, 0.5)`
 * @returns {boolean} `true` if `text` is a valid `rgba()` syntax.
 */
function parseRGBA( text ) {
    const m = RX_RGBA.exec( text );
    if ( !m ) return false;
    this.R = clamp01( parseInt( m[ 1 ], 10 ) * INV255 );
    this.G = clamp01( parseInt( m[ 2 ], 10 ) * INV255 );
    this.B = clamp01( parseInt( m[ 3 ], 10 ) * INV255 );
    this.A = clamp01( parseFloat( m[ 4 ] ) );
    return true;
}

const RX_HSL = /^HSL[\s\(]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)/;

/**
 * @this Color
 * @param   {string} text - `hsl(200, 140, 50)`
 * @returns {boolean} `true` if `text` is a valid `hsl()` syntax.
 */
function parseHSL( text ) {
    const m = RX_HSL.exec( text );
    if ( !m ) return false;
    this.H = clamp01( parseInt( m[ 1 ], 10 ) * INV359 );
    this.S = clamp01( parseInt( m[ 2 ], 10 ) * INV99 );
    this.L = clamp01( parseInt( m[ 3 ], 10 ) * INV99 );
    this.A = 1;
    this.hsl2rgb();
    return true;
}

function hexa2( value ) {
    let out = Math.floor( value ).toString( 16 );
    if ( out.length < 2 ) out = "0" + out;
    return out;
}


function copy() {
    const newColor = new Color();
    newColor.R = this.R;
    newColor.G = this.G;
    newColor.B = this.B;
    newColor.A = this.A;
    newColor.H = this.H;
    newColor.S = this.S;
    newColor.L = this.L;
    return newColor;
}


function newRGB( red, green, blue ) {
    const color = new Color();
    color.R = red;
    color.G = red;
    color.B = red;
    return color;
}

function newRGBA( red, green, blue, alpha ) {
    const color = new Color();
    color.R = red;
    color.G = red;
    color.B = red;
    color.A = red;
    return color;
}

function clamp01( v ) {
    if ( v < 0 ) return 0;
    if ( v > 1 ) return 1;
    return v;
}


function staticParse( text ) {
    const color = new Color();
    color.parse( text );
    return color;
}

function staticLuminance( text ) {
    const color = staticParse( text );
    return color.luminance();
}