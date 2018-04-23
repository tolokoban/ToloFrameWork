"use strict";

var CODE_BEHIND = {
  onChanged: onChanged
};


var $ = require("dom");
var Md5 = require("md5");


function onChanged() {
  var img = this.$elements.img.$;
  
  $.addClass( img, "hide" );
  img.onLoad = function() {
    $.removeClass( img, "hide" );
  };
  var md5 = this.value;
  if( md5.indexOf('@') > -1 ) {
    md5 = Md5( md5 );
  }
  img.src = "https://secure.gravatar.com/avatar/" + md5
    + "?s=" + this.size + "&r=pg&d=" + this.theme;
}
