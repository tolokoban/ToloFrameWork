"use strict";

var CODE_BEHIND = {
  onChanged: onChanged
};


var $ = require("dom");
var Md5 = require("md5");


function onChanged() {
  var img = this.$elements.img.$;
  
  $.addClass( img, "hide" );
  $.css( this, {
    width: this.size + "px",
    height: this.size + "px"
  });
  img.onload = function() {
    $.removeClass( img, "hide" );
  };
  img.onerror = function() {
    console.error("Unable to load Gravatar image:", img.src);
  };
  var md5 = this.value;
  if( md5.indexOf('@') > -1 ) {
    md5 = Md5( md5 );
  }
  img.src = "https://secure.gravatar.com/avatar/" + md5
    + "?s=" + this.size + "&r=pg&d=" + this.theme;
}
