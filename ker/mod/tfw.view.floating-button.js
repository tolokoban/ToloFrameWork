"use strict";

var CODE_BEHIND = {
  getClasses: getClasses,
  onKeyUp: onKeyUp,
  onEnabledChanged: onEnabledChanged,
  init: init,
  on: on,
  fire: fire
};


var PM = require("tfw.binding.property-manager");
var Touchable = require("tfw.touchable");


function getClasses() {
  return ["thm-bg" + this.type];
}


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
  if( !this.enabled ) return;
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
  if( !this.enabled ) return;
  if( evt.keyCode != 32 && evt.keyCode != 13 ) return;
  evt.preventDefault();
  evt.stopPropagation();
  this.action = this.tag;
}

function init() {
  this._touchable = new Touchable( this.$ );
  this._touchable.tap.add( this.fire.bind( this, undefined ) );
  this._touchable.enabled = this.enabled;
}

function onEnabledChanged( v ) {
  if( !this._touchable ) return;
  this._touchable.enabled = v;
}
