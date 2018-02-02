"use strict";

var CODE_BEHIND = {
  onValueChanged: onValueChanged,
  onTap: onTap
};

var CHROMATIC_REGIONS = 24;
var INV_CHROMATIC_REGIONS = 1 / CHROMATIC_REGIONS;

var $ = require("dom");
var PM = require("tfw.binding.property-manager");
var Color = require("tfw.color");
var Dialog = require("wdg.modal");
var ButtonFactory = require("tp.factory.button");

function onValueChanged( cssColor ) {
  this.$elements.button.$.style.color = textColor( cssColor );
}


var COLORS = [
  'F44336', 'E91E63', '9C27B0', '673AB7', '3F51B5',
  '2196F3', '03A9F4', '00BCD4', '009688', '4CAF50',
  '8BC34A', 'CDDC39', 'FFEB3B', 'FFC107', 'FF9800',
  'FF5722', '795548', '9E9E9E', '607D8B', '000000'
];


function onTap() {
  var that = this;

  var btnClose = ButtonFactory.cancel();
  var content = $.div('tfw-view-color-input-dialog');
  var dialog = new Dialog({
    header: this.label,
    content: content,
    footer: btnClose
  });
  PM( btnClose ).on( "action", dialog.detach.bind( dialog ) );
  dialog.attach();
  var done = function( color ) {
    dialog.detach();
    window.setTimeout(function() {
      that.value = color;
    }, 300);
  };

  pageChromaticRegion( content )
    .then(function( color ) {
      return pageHueSelection( content, color );
    })
    .then(function( color ) {
      return pageLuminance( content, color );
    })
    .then( done );
}

function pageHueSelection( content, selectedCssColor ) {
  return new Promise(function (resolve, reject) {
    $.clear( content, $.tag("h2", [_('hue-selection') + " - 2/3"]) );
    var cssColor;
    var color = Color.instance;
    color.parse( selectedCssColor );
    color.rgb2hsl();
    var overlap = 1;
    var size = 2 * overlap * INV_CHROMATIC_REGIONS;
    var H0 = color.H - size * 0.5;
    for( var k=0; k<CHROMATIC_REGIONS; k++ ) {
      color.H = H0 + size * k * INV_CHROMATIC_REGIONS;
      color.hsl2rgb();
      cssColor = color.stringify();
      $.add( content, createColorButton(
        cssColor, buttonEventHandler.bind( null, resolve, cssColor )
      ));
    }
  });
}

function pageLuminance( content, selectedCssColor ) {
  return new Promise(function (resolve, reject) {
    $.clear( content, $.tag("h2", [_('luminance') + " - 3/3"]) );
    var cssColor;
    var color = Color.instance;
    color.parse( selectedCssColor );
    color.rgb2hsl();
    for( var L=0.9; L>0.3; L-=0.1 ) {
      color.L = L;
      for( var S=1; S>.3; S-=0.2 ) {
        color.S = S;
        color.hsl2rgb();
        cssColor = color.stringify();
        $.add( content, createColorButton(
          cssColor, buttonEventHandler.bind( null, resolve, cssColor )
        ));
      }
    }
  });
}

function pageChromaticRegion( content ) {
  return new Promise(function (resolve, reject) {
    $.clear( content, $.tag("h2", [_('chromatic-region') + " - 1/3"]) );
    var cssColor;
    var color = Color.instance;
    for( var k=0; k<CHROMATIC_REGIONS; k++ ) {
      color.H = k * INV_CHROMATIC_REGIONS;
      color.S = 1;
      color.L = 0.7;
      color.hsl2rgb();
      cssColor = color.stringify();
      $.add( content, createColorButton(
        cssColor, buttonEventHandler.bind( null, resolve, cssColor )
      ));
    }
  });
}

function buttonEventHandler( resolve, color ) {
  resolve( color );
}

function createColorButton( background, onTap ) {
  var foreground = textColor( background );
  var btn = $.tag("button", "thm-ele2");
  $.css( btn, {
    background: background,
    color: foreground
  });
  btn.textContent = background;
  $.on( btn, onTap );
  return btn;
}


function textColor( color ) {
  Color.instance.parse( color );
  var luminance = Color.instance.luminance();

  return luminance < .6 ? '#fff' : '#000';
}
