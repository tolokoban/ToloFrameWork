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
      $.removeClass( 'disabled' );
    } else {
      $.addClass( 'disabled' );
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
    DB.fire( this, 'action', this.value );
  }
};


module.exports = FloatingButton;
