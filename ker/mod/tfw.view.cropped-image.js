"use strict";

var $ = require("dom");


var CODE_BEHIND = {
  init: init,
  onUrlChanged: onUrlChanged
};


function init() {
  var that = this;

  this.canvas = this.$elements.canvas.$;
  clearCanvas.call( this );
  
  var screen = this.$elements.img.$;
  screen.onload = function() {
    $.removeClass( screen, "hide" );

    var img = new Image();
    img.onload = onImageToPutIntoCanvasLoaded.bind( that, img );
    img.onerror = function() {
      console.error("Unable to load image from URL: ", img.src);
    };
    img.src = that._newUrl;
    that._newUrl = null;
  };
}

function onUrlChanged( newUrl ) {
  var that = this;
  this._newUrl = newUrl;
  this.$elements.img.$.src = this.$elements.canvas.$.toDataURL();
}


function onImageToPutIntoCanvasLoaded( img ) {
  $.addClass( this.$elements.img, "hide" );
  if( img.height < 1 || img.width < 1 ) return;

  if( isHorizontalOverflow.call( this, img ) ) {
    cropHorizontally.call( this, img );
  } else {
    cropVertically.call( this, img );
  }
  this.canvas = this.$elements.canvas.$;
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
  clearCanvas.call( this );
  var w = img.width;
  var h = img.height;
  ctx.drawImage( img, 0, 0, w, h, x, y, w * zoom, h * zoom );
}


function clearCanvas() {
  var ctx = this.canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
}
