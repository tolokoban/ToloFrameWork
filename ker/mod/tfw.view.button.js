"use strict";

var CODE_BEHIND = {
  getClasses: getClasses,
  onSmallChanged: onSmallChanged,
  onKeyUp: onKeyUp,
  on: on,
  fire: fire
};

var PM = require("tfw.binding.property-manager");

/**
 * @member on
 * Set a event listener to the button.
 * @param {function} slot - function to call when the button is tapped.
 */
function on( slot ) {
  PM( this ).on( "action", slot );
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

function getClasses() {
  var classes = [];
  if( this.flat ) {
    if( this.pressed ) {
      switch( this.type ) {
      case 'default': classes.push("thm-bg3"); break;
      case 'primary': classes.push("thm-bgP"); break;
      case 'secondary': classes.push("thm-bgS"); break;
      }
    } else {      
      switch( this.type ) {
      case 'primary': classes.push("thm-fgP"); break;
      case 'secondary': classes.push("thm-fgS"); break;
      }
    }
  } else {
    switch( this.type ) {
    case 'default': classes.push("thm-bg3"); break;
    case 'primary': classes.push("thm-bgP"); break;
    case 'secondary': classes.push("thm-bgS"); break;
    }
    if( this.pressed ) {
      classes.push("thm-ele4");
    } else {
      classes.push("thm-ele2");
    }
  }
  return classes;
}


function onSmallChanged( isSmall ) {
  this.$elements.icon.size = isSmall ? 20 : 28;
}


function onKeyUp( evt ) {
  if( evt.keyCode != 32 && evt.keyCode != 13 ) return;
  evt.preventDefault();
  evt.stopPropagation();
  this.action = this.tag;
  this.pressed = false;  
}

