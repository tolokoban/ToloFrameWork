"use strict";

var CODE_BEHIND = {
  getClasses: getClasses,
  onSmallChanged: onSmallChanged,
  onKeyUp: onKeyUp
};



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

