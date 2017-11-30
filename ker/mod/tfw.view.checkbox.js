"use strict";

var CODE_BEHIND = {
  onKeyUp: function( evt ) {
    if( ["enter", "space"].indexOf( evt.code.toLowerCase() ) > -1 ) {
      this.value = !this.value;
    }
  }
};
