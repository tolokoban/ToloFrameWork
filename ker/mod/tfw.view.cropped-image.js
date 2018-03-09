"use strict";


var CODE_BEHIND = {
  toDataURL: toDataURL,
  onFileChanged: onFileChanged
};


var $ = require("dom");


function toDataURL(type, encoderOptions) {
  var canvas = createCanvas.call( this );
  var ctx = canvas.getContext( "2d" );
  ctx.drawImage( this.$elements.img.$, 0, 0 );
  return canvas.toDataURL( type, encoderOptions );
}

function onFileChanged( file ) {
  var that = this;

  var reader = new FileReader();
  reader.addEventListener("load", function() {
    adjustSizeAndAlignment.call( that, reader.result ).then(function(url) {
      that.src = url;
      that.changed = true;
    });
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
    x = 0.5 * (this.width - img.width * zoom);
  }
  else if( this.cropping == 'tail' ) {
    x = this.width - img.width * zoom;
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
    y = 0.5 * (this.height - img.height * zoom);
  }
  else if( this.cropping == 'tail' ) {
    y = this.height - img.height * zoom;
  }
  draw.call( this, img, 0, y, zoom );
}


function draw( img, x, y, zoom ) {
  var ctx = clearCanvas.call( this );
  var w = img.width;
  var h = img.height;
  ctx.drawImage( img, 0, 0, w, h, x, y, w * zoom, h * zoom );
}


function clearCanvas() {
  var ctx = this.canvas.getContext("2d");
  ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
  return ctx;
}


function adjustSizeAndAlignment( url ) {
  var that = this;

  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function() {
      var w = img.width;
      var h = img.height;
      getCroppingOptions.call(that, img).then(function(options) {
        var canvas = createCanvas.call( that );
        var ctx = canvas.getContext("2d");
        options.containerWidth = that.width;
        options.containerHeight = that.height;
        var transfo = options.cropping === 'cover' ? getCoverZoom( options ) : getContainZoom( options );
        var x = transfo.x;
        var y = transfo.y;
        var zoom = transfo.zoom;
        ctx.drawImage( img, 0, 0, w, h, x, y, w * zoom, h * zoom);
        resolve( canvas.toDataURL() );
      }).catch( reject );
    };
    img.onerror = reject;
    img.src = url;
  });
}


function getCroppingOptions( img ) {
  var that = this;

  return new Promise(function (resolve, reject) {
    resolve({
      cropping: that.cropping,
      alignX: that.alignX,
      alignY: that.alignY,
      imageWidth: img.width,
      imageHeight: img.height
    });
  });
}

/**
 * @param {number} opt.imageWidth
 * @param {number} opt.imageHeight
 * @param {number} opt.containerWidth
 * @param {number} opt.containerHeight
 * @return {number} Zoom factor to apply to the image dimensions.
 */
function getCoverZoom( opt ) {
  var imageRatio = opt.imageWidth / opt.imageHeight;
  var containerRatio = opt.containerWidth / opt.containerHeight;
  var x = 0, y = 0, zoom;
  
  if( imageRatio < containerRatio ) {
    zoom = opt.containerWidth / opt.imageWidth;
    if( opt.alignY === 'middle' ) {
      y = 0.5 * (opt.containerHeight - opt.imageHeight * zoom);
    }
    else if( opt.alignY === 'end' ) {
      y = opt.containerHeight - opt.imageHeight * zoom;
    }
  } else {
    zoom = opt.containerHeight / opt.imageHeight;
    if( opt.alignX === 'middle' ) {
      x = 0.5 * (opt.containerWidth - opt.imageWidth * zoom);
    }
    else if( opt.alignX === 'end' ) {
      x = opt.containerWidth - opt.imageWidth * zoom;
    }
  }

  return { x: x, y: y, zoom: zoom };
}

/**
 * @param {number} opt.imageWidth
 * @param {number} opt.imageHeight
 * @param {number} opt.containerWidth
 * @param {number} opt.containerHeight
 * @return {number} Zoom factor to apply to the image dimensions.
 */
function getContainZoom( opt ) {
  var imageRatio = opt.imageWidth / opt.imageHeight;
  var containerRatio = opt.containerWidth / opt.containerHeight;
  var x = 0, y = 0, zoom;
  
  if( imageRatio > containerRatio ) {
    zoom = opt.containerWidth / opt.imageWidth;
    if( opt.alignY === 'middle' ) {
      y = 0.5 * (opt.containerHeight - opt.imageHeight * zoom);
    }
    else if( opt.alignY === 'end' ) {
      y = opt.containerHeight - opt.imageHeight * zoom;
    }
  } else {
    zoom = opt.containerHeight / opt.imageHeight;
    if( opt.alignX === 'middle' ) {
      x = 0.5 * (opt.containerWidth - opt.imageWidth * zoom);
    }
    else if( opt.alignX === 'end' ) {
      x = opt.containerWidth - opt.imageWidth * zoom;
    }
  }

  return { x: x, y: y, zoom: zoom };
}

function createCanvas() {
  var canvas = document.createElement("canvas");
  canvas.setAttribute( "width", this.width );
  canvas.setAttribute( "height", this.height );
  return canvas;
}
