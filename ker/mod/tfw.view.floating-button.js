"use strict";

var CODE_BEHIND = {
  onTap: onTap,
  getClasses: getClasses,
  onKeyUp: onKeyUp,
  on: on,
  fire: fire
};


var PM = require("tfw.binding.property-manager");


function onTap( evt ) {
  console.info("[tfw.view.floating-button] evt=", evt);
  evt.srcEvent.stopPropagation();
  this.action = this.tag;
}


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
  this.action = this.tag;
}

