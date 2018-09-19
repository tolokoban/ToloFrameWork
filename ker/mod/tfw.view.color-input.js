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
var Tapable = require("tfw.view.tapable");
var Textbox = require("tfw.view.textbox");
var ButtonFactory = require("tfw.factory.button");


function onValueChanged( cssColor ) {
  this.$elements.button.$.style.color = textColor( cssColor );
}

function onTap() {
  var that = this;

  var btnClose = ButtonFactory.cancel();
  var palette = $.div();
  var textbox = new Textbox({
    wide: true, label: _("expert-label"), value: this.value, width: "240px"
  });
  var hint = $.div("hint", [_('expert-hint')]);
  var pastille = $.div("pastille", ["X"]);
  $.css( pastille, { background: this.value });
  var expert = $.div( "expert", [
    $.tag('hr'),
    $.div("flex", [ textbox, pastille ]),
    hint
  ]);
  var content = $.div( "tfw-view-color-input-dialog", [ palette, expert ] );
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

  pageChromaticRegion( palette )
    .then(function( color ) {
      textbox.value = color;
      return pageHueSelection( palette, color );
    })
    .then(function( color ) {
      textbox.value = color;
      return pageLuminance( palette, color );
    })
    .then( done );

  PM( textbox ).on( "action", function() {
    done( Color.parse( textbox.value ).stringify() );
  });
  PM( textbox ).on( "value", function( v ) {
    var color = Color.parse( textbox.value ).stringify();
    $.css( pastille, { background: color });
  });
}

function pageHueSelection( content, selectedCssColor ) {
  return new Promise(function (resolve, reject) {
    $.clear( content, $.div([_('hue-selection') + " - 2/3"]) );
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
    $.clear( content, $.div([_('luminance') + " - 3/3"]) );
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
    $.clear( content, $.div([_('chromatic-region') + " - 1/3"]) );
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
  var tapable = new Tapable({ content: btn });
  tapable.on( onTap );
  return tapable;
}


function textColor( color ) {
  Color.instance.parse( color );
  var luminance = Color.instance.luminance();

  return luminance < .6 ? '#fff' : '#000';
}
