"use strict";

const
    $ = require( "dom" ),
    PM = require( "tfw.binding.property-manager" ),
    Hammer = require( "external.hammer" ),
    Converters = require( 'tfw.binding.converters' );


/**
 * @class Tag
 * @param {string} tagName - For instance DIV, SPAN, BUTTON, ...
 * @param {object} attribs - Attributes of this HTML element.
 */
exports.Tag = Tag;

/**
 * @param {object} CODE_BEHIND
 * @param {string...} functionName - Name of a function that must be defined in the code behind.
 */
exports.ensureCodeBehind = ensureCodeBehind;

/**
 * @param {object} element
 * @param {function} events.tap
 * @param {function} events.press
 * @param {function} events.pan
 * @param {function} events.swipe
 *
 * @example
 * ```
 * var View = require("tfw.view");
 * View.events( div, {
 *   "tap": function( evt ) {...},
 *   "press": function( evt ) {...}
 * });
 * ```
 */
exports.events = events;

/**
 * Assign default values.
 * @param {object} target
 * @param {object} args - Already defined arguments (with their values) on `target`.
 * @param {object} defaultValues - Map of default values to apply if they don't exist in `args`.
 */
exports.defVal = defVal;

exports.addClassIfTrue = addClassIfTrue;
exports.addClassIfFalse = addClassIfFalse;
exports.addAttribIfTrue = addAttribIfTrue;
exports.addAttribIfFalse = addAttribIfFalse;


function Tag( tagName, attribs ) {
    tagName = tagName.trim().toLowerCase();

    var elem = tagName === 'svg' ? $.svgRoot() : newTag( tagName );
    Object.defineProperty( this, '$', {
        value: elem,
        writable: false,
        enumerable: true,
        configurable: false
    } );

    if ( Array.isArray( attribs ) ) {
        var that = this;
        attribs.forEach( function ( attName ) {
            switch ( attName.toLowerCase() ) {
            case 'value':
                defineAttribValue.call( that, elem );
                break;
            case 'focus':
                defineAttribFocus.call( that, elem );
                break;
            case 'textcontent':
                defineAttribTextContent.call( that, elem );
                break;
            case 'innerhtml':
                defineAttribInnerHTML.call( that, elem );
                break;
            default:
                defineStandardAttrib.call( that, elem, attName );
            }
        } );
    }
}

/**
 * Apply a  set of CSS  classes after removing the  previously applied
 * one for the same `id`.
 */
Tag.prototype.applyClass = function ( newClasses, id ) {
    var elem = this.$;
    if ( typeof id === 'undefined' ) id = 0;
    if ( typeof this._applyer === 'undefined' ) this._applyer = {};
    if ( !Array.isArray( newClasses ) ) newClasses = [ newClasses ];

    var oldClasses = this._applyer[ id ];
    if ( Array.isArray( oldClasses ) ) {
        oldClasses.forEach( $.removeClass.bind( $, elem ) );
    }
    this._applyer[ id ] = newClasses;
    newClasses.forEach( $.addClass.bind( $, elem ) );
};



var SVG_TAGS = [ "g", "rect", "circle", "line", "path", "defs" ];

function newTag( name ) {
    if ( SVG_TAGS.indexOf( name.toLowerCase() ) !== -1 ) return $.svg( name );
    return $.tag( name );
}


function defineAttribValue( elem ) {
    var that = this;

    var lastSettedValue = null;
    PM( this ).create( 'value', {
        get: function () { return lastSettedValue; },
        set: function ( v ) {
            elem.value = v;
            lastSettedValue = v;
        }
    } );
    elem.addEventListener( "input", function ( evt ) {
        PM( that ).change( 'value', evt.target.value );
    }, false );
}

function defineAttribFocus( elem ) {
    var that = this;
    PM( this ).create( 'focus', {
        cast: Converters.get( 'boolean' )(),
        delay: 1
    } );
    PM( this ).on( "focus", function ( v ) {
        if ( v ) elem.focus();
        else elem.blur();
    } );
    elem.addEventListener( "focus", function () {
        that.focus = true;
    }, false );
    elem.addEventListener( "blur", function () {
        that.focus = false;
    }, false );
}

function defineAttribTextContent( elem ) {
  [ "textContent", "textcontent" ].forEach( function ( name ) {
        PM( this ).create( name, {
            get: function () { return elem.textContent; },
            set: function ( v ) {
                if ( typeof v !== 'string' ) v = "" + v;

                if ( v.substr( 0, 6 ) === '<html>' )
                    elem.innerHTML = v.substr( 6 );
                else
                    elem.textContent = v;
            }
        } );
    }, this );
}

function defineAttribInnerHTML( elem ) {
  [ "innerHTML", "innerhtml" ].forEach( function ( name ) {
        PM( this ).create( name, {
            get: function () { return elem.innerHTML; },
            set: function ( v ) {
                elem.innerHTML = v;
            }
        } );
    }, this );
}

function defineStandardAttrib( elem, attName ) {
    PM( this ).create( attName, {
        get: function () {
            return elem.getAttribute( attName );
        },
        set: function ( v ) {
            elem.setAttribute( attName, v );
        }
    } );
}

/**
 * Check if all needed function from code behind are defined.
 */
function ensureCodeBehind( code_behind ) {
    if ( typeof code_behind === 'undefined' )
        throw "Missing mandatory global variable CODE_BEHIND!";

    var i, funcName;
    for ( i = 1; i < arguments.length; i++ ) {
        funcName = arguments[ i ];
        if ( typeof code_behind[ funcName ] !== 'function' )
            throw "Expected CODE_BEHIND." + funcName + " to be a function!";
    }
};


var GESTURES = [
  "tap", "doubletap", "press",
  "pan", "panstart", "panmove", "panup", "pandown", "panleft", "panright", "panend", "pancancel",
  "swipe", "swipeleft", "swipteright", "swipetop", "swipebottom",
  "pinch", "pinchin", "pinchout", "pinchstart", "pinchmove", "pinchend", "pinchcancel",
  "rotate", "rotatestart", "rotatemove", "rotateend", "rotatecancel"
];

/**
 * @param {object} events - Events to register on.
 * @param {function} events.tap
 * @param {function} events.press
 * @param {function} events.pan
 * @param {function} events.swipe
 *
 * @example
 * ```
 * var View = require("tfw.view");
 * View.events( div, {
 *   "tap": function( evt ) {...},
 *   "press": function( evt ) {...}
 * });
 * ```
 */
function events( target, events ) {
    $.on( target, events );
    /*
    var elem = $( target );
    var gestures = {};
    var hasGestures = 0;

    Object.keys( events ).forEach( function ( eventName ) {
        eventName = eventName.toLowerCase();
        var eventSlot = events[ eventName ];
        if ( GESTURES.indexOf( eventName ) > -1 ) {
            gestures[ eventName ] = eventSlot;
            hasGestures = true;
        } else {

            elem.addEventListener( eventName, eventSlot, false );
        }
    } );

    if ( hasGestures ) {
        var gestureHandler = new Hammer( elem );
        Object.keys( gestures ).forEach( function ( eventName ) {
            var eventSlot = events[ eventName ];
            gestureHandler.on( eventName, eventSlot );
        } );
    }*/
};

/**
 * Assign default values.
 */
function defVal( target, args, defaultValues ) {
    var key, val;
    for ( key in defaultValues ) {
        val = defaultValues[ key ];
        if ( typeof args[ key ] === 'undefined' ) {
            target[ key ] = val;
        } else {
            target[ key ] = args[ key ];
        }
    }
};


function addClassIfTrue( element, className, value ) {
    if ( value ) $.addClass( element, className );
    else $.removeClass( element, className );
}

function addClassIfFalse( element, className, value ) {
    if ( value ) $.removeClass( element, className );
    else $.addClass( element, className );
}

function addAttribIfTrue( element, attribName, value ) {
    if ( value ) $.att( element, attribName );
    else $.removeAtt( element, attribName );
}

function addAttribIfFalse( element, attribName, value ) {
    if ( value ) $.removeAtt( element, attribName );
    else $.att( element, attribName );
}