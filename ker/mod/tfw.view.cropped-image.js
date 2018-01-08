"use strict";

var $ = require("dom");


var CODE_BEHIND = {
  init: init,
  onUrlChanged: onUrlChanged,
  onFileChanged: onFileChanged,
  onLabelChanged: onLabelChanged
};


function init() {
  var that = this;

  this.canvas = this.$elements.canvas.$;
  clearCanvas.call( this );

  var screen = this.$elements.img.$;
  screen.crossOrigin = "anonymous";
  screen.onload = function() {
    $.removeClass( screen, "hide" );

    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = onImageToPutIntoCanvasLoaded.bind( that, img );
    img.onerror = function( err ) {
      console.error( "Unable to load image from URL: ", img.src );
      console.error( err );
    };
    img.src = that._newUrl;
    that._newUrl = null;
  };
}

function onLabelChanged( textContent ) {
  var label = this.$elements.label;

  textContent = textContent.trim();
  if( textContent.length === 0 ) {
    $.addClass( label, "hide" );
    return;
  }

  $.removeClass( label, "hide" );
  label.$.textContent = textContent;
}

function onUrlChanged( newUrl ) {
  var that = this;
  this._newUrl = newUrl;
  this.$elements.img.$.src = this.$elements.canvas.$.toDataURL();
}


function onFileChanged( file ) {
  var that = this;

  var reader = new FileReader();
  reader.addEventListener("load", function() {
    that.url = reader.result;
    that.changed = true;
  });
  reader.readAsDataURL( file );
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
  if( this.cropping == 'body' ) {
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
  if( this.cropping == 'body' ) {
    y = 0.5 * (this.height - img.height);
  }
  else if( this.cropping == 'tail' ) {
    y = this.height - img.height;
  }
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
