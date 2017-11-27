"use strict";

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