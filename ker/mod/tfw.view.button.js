"use strict";

const CODE_BEHIND = {
    getClasses,
    getClassesForText,
    onWidthChanged,
    onSmallChanged,
    onEnabledChanged,
    onKeyUp,
    on,
    fire,
    init
};

const
    $ = require( "dom" ),
    PM = require( "tfw.binding.property-manager" ),
    Touchable = require( "tfw.touchable" );

/**
 * Set a event listener to the button.
 * @this tfw.view.button
 * @param {function} slot - function to call when the button is tapped.
 * @returns {this} Set the function to call at any tap.
 */
function on( slot ) {
    PM( this ).on( "action", slot );
    return this;
}

function onWidthChanged( v ) {
    if ( this.wide ) {
        delete this.$.style.width;
    } else {
        this.$.style.width = v;
    }
}

/**
 * Fire the tap event.
 * @this tfw.view.button
 * @param {any} tag - If defined, set `this.tag` to it.
 * @returns {this} Set the function to call at any tap.
 */
function fire( tag ) {
    if ( typeof tag !== 'undefined' ) this.tag = tag;
    if ( this.href.length > 0 ) {
        if ( this.target.length > 0 ) {
            window.open( this.href, this.target );
        } else {
            window.location = this.href;
        }
    } else {
        this.action = this.tag;
    }
}

/**
 * @this tfw.view.button
 * @returns {array} Array of classes to set for the text.
 */
function getClassesForText() {
    if ( !this.flat ) return [];
    switch ( this.type ) {
    case 'primary':
        return [ 'thm-fgP' ];

    case 'secondary':
        return [ 'thm-fgS' ];

    default:
        return [];
    }
}

/**
 * @this tfw.view.button
 * @returns {array} Array of classes to set for the button.
 */
function getClasses() {
    const
        classes = [],
        background = {
            'default': 'thm-bg3',
            'primary': 'thm-bgP',
            'secondary': 'thm-bgS'
        },
        foreground = {
            'primary': 'thm-fgP',
            'secondary': 'thm-fgS'
        };
    if ( this.flat ) {
        if ( this.pressed ) {
            classes.push( background[ this.type ] );
        } else {
            classes.push( foreground[ this.type ] );
        }
    } else {
        classes.push( background[ this.type ] );
        if ( this.pressed ) {
            classes.push( "thm-ele4" );
        } else {
            classes.push( "thm-ele2" );
        }
    }
    return classes.filter( ( cls ) => typeof cls === 'string' );
}


function onSmallChanged( isSmall ) {
    this.$elements.icon.size = isSmall ? 20 : 28;
}


function onKeyUp( evt ) {
    if ( evt.keyCode != 32 && evt.keyCode != 13 ) return;
    evt.preventDefault();
    evt.stopPropagation();
    fire.call( this );
    this.pressed = false;
}

function init() {
    var that = this;

    this._touchable = new Touchable( this.$ );
    this._touchable.tap.add( function () { fire.call( that ); } );
    this._touchable.enabled = this.enabled;
}

function onEnabledChanged() {
    if ( !this._touchable ) return;
    var enabled = this.enabled && !this.wait;
    this._touchable.enabled = enabled;
    if ( enabled ) {
        $.removeAtt( this, "disabled" );
    } else {
        $.att( this, { disabled: true } );
    }
}