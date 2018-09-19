"use strict";

var CODE_BEHIND = {
  onKeyUp: onKeyUp,
  on: on,
  fire: fire,
  init: init,
  onEnabledChanged: onEnabledChanged
};

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Touchable = require("tfw.touchable");

/**
 * @member on
 * Set a event listener to the button.
 * @param {function} slot - function to call when the button is tapped.
 */
function on( slot ) {
  PM( this ).on( "action", slot );
  return this;
}

/**
 * @member fire
 * Fire the tap event.
 * @param {any=undefined} tag - If defined, set `this.tag` to it.
 */
function fire( tag ) {
  if( typeof tag !== 'undefined' ) this.tag = tag;
  if( this.href.length > 0 ) {
    if( this.target.length > 0 ) {
      window.open( this.href, this.target );
    } else {
      window.location = this.href;
    }
  } else {
    this.action = this.tag;
  }
}

function onKeyUp( evt ) {
  if( evt.keyCode != 32 && evt.keyCode != 13 ) return;
  evt.preventDefault();
  evt.stopPropagation();
  fire.call( this );
  this.pressed = false;  
}

function init() {
  var that = this;

  this._touchable = new Touchable( this.$ );
  this._touchable.tap.add(function() { fire.call( that ); });
  this._touchable.enabled = this.enabled;
}

function onEnabledChanged() {  
  if( !this._touchable ) return;
  var enabled = this.enabled && !this.wait;
  this._touchable.enabled = enabled;
  if( enabled ) {
    $.removeAtt( this, "disabled" );
  } else {
    $.att( this, { disabled: true } );
  }
}
