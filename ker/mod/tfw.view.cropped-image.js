"use strict";

var $ = require("dom");


var CODE_BEHIND = {
  onUrlChanged: onUrlChanged
};


function onUrlChanged( newUrl ) {
  var that = this;

  this.$elements.img.$.src = this.$elements.canvas.$.toDataURL();
  $.removeClass( this.$elements.img, "hide" );

  var img = new Image();
  img.onload = onImageToPutIntoCanvasLoaded.bind( that, img );
  img.onerror = function() {
    console.error("Unable to load image from URL: ", img.src);
  };
  img.src = newUrl;
}


function onImageToPutIntoCanvasLoaded( img ) {
  $.addClass( this.$elements.img, "hide" );
  if( img.height < 1 || img.width < 1 ) return;
  
  if( isHorizontalOverflow.call( this, img ) ) {
    cropHorizontally.call( this, img );
  } else {
    cropVertically.call( this, img );
  }
}


function isHorizontalOverflow( img ) {
  var ratioCanvas = this.width / this.height;
  var ratioImage = img.width / img.height;
  return ratioImage > ratioImage;
}


/**
 * If img is set to have the same height as the view, it will overflow horizontally.
 */
function cropHorizontally( img ) {
  var zoom = this.height / img.height;
  var x = 0;
  if( this.cropping == 'center' ) {
    x = 0.5 * (this.width - img.width);
  }
  else if( this.cropping == 'tail' ) {
    x = this.width - img.width;
  }
  draw.call( this, img, x, 0, zoom );
}


/**
 * If img is set to have the same width as the view, it will overflow vertically.
 */
function cropVertically( img ) {
  var zoom = this.width / img.width;
  var y = 0;
  draw.call( this, img, 0, y, zoom );
}


function draw( img, x, y, zoom ) {
  var ctx = this.$elements.canvas.$.getContext( "2d" );
  ctx.clearRect( 0, 0, this.width, this.height );
  var w = img.width;
  var h = img.height;
  ctx.drawImage( img, 0, 0, w, h, x, y, w * zoom, h * zoom );
}
