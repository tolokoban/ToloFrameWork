/**
 * @class FloatingButton
 * @constructor
 * @param {string} opts.icon - Icon's name.
 * @param {string} opts.type - "primary" or "secondary". Anything else is considered as "default".
 * @param {string} opts.href - If defined, make the button acts like an hyperlink.
 * @param {boolean} opts.enabled - Tapable only when enabled.
 * @param {boolean} opts.small - Small buttons are 40x40 instead of 56x56.
 * @param {any} opts.value - The value `action` will fire when the button is taped.
 * @param {boolean} opts.visible - Widget visibility.
 *
 * @member {FloatingButton} on
 * @param {function} callback - Function to call when the button is taped.
 *
 * @member {FloatingButton} fire
 * Simulate a physical tap.
 *
 * @export {FloatingButton}
 */
"use strict";

var $ = require( "dom" );
var DB = require( "tfw.data-binding" );
var Icon = require( "wdg.icon" );
var Touchable = require( "tfw.touchable" );

var TYPES = [ 'standard', 'primary', 'secondary' ];

var FloatingButton = function( opts ) {
  var that = this;

  var icon = new Icon({ size: "24px" });
  var elem = $.elem( this, 'button', 'dom', 'custom', 'wdg-floating-button', 'thm-ele6', [icon] );
  var touchable = new Touchable( elem, {
    classToAdd: 'thm-ele12'
  } );

  DB.prop( this, 'value' );
  DB.prop( this, 'icon' )(function( v ) {
    icon.content = v;
  });
  DB.propAddClass( this, 'small' );
  DB.propEnum( TYPES )( this, 'type' )(function(v) {
    $.removeClass( elem, 'thm-bg3', 'thm-bgP', 'thm-bgS' );
    switch( v ) {
    case 'primary': $.addClass( elem, 'thm-bgP' ); break;
    case 'secondary': $.addClass( elem, 'thm-bgS' ); break;
    default: $.addClass( elem, 'thm-bg3' ); break;
    }
  });
  DB.propBoolean( this, 'enabled' )( function ( v ) {
    touchable.enabled = v;
    if( v ) {
      $.removeClass( elem, 'disabled' );
    } else {
      $.addClass( elem, 'disabled' );
    }
  } );
  DB.prop( this, 'action', 0 );
  DB.propRemoveClass( this, 'visible', 'hide' );

  opts = DB.extend( {
    type: "standard",
    value: "action",
    action: 0,
    small: false,
    enabled: true,
    icon: "add",
    href: null,
    visible: true
  }, opts, this );

  // Animate the pressing.
  $.on( this.element, {
    keydown: function ( evt ) {
      if ( evt.keyCode == 13 || evt.keyCode == 32 ) {
        evt.preventDefault();
        evt.stopPropagation();
        that.fire();
      }
    }
  } );
  touchable.tap.add( that.fire.bind( that ) );
};

/**
 * @class Button
 * @function on
 * @param {function} slot - Function to call when `action` has changed.
 */
FloatingButton.prototype.on = function ( slot ) {
  DB.bind( this, 'action', slot );
  return this;
};

/**
 * Simulate a click on the button if it is enabled.
 */
FloatingButton.prototype.fire = function () {
  if ( this.enabled ) {
    if( typeof this.href === 'string' && this.href.trim().length > 0 ) {
      location = this.href;
    } else {
      DB.fire( this, 'action', this.value );
    }
  }
};


module.exports = FloatingButton;
