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
  COLORS.forEach(function (item) {
    var background = "#" + item;
    var foreground = textColor( background );
    var btn = $.tag("button", "thm-ele2");
    $.css( btn, {
      background: background,
      color: foreground
    });
    btn.textContent = background;
    $.add( content, btn );
    $.on( btn, function() {
      that.value = background;
      dialog.detach();
    });
  });
  PM( btnClose ).on( "action", dialog.detach.bind( dialog ) );
  dialog.attach();
}

function pageChromaticRegion( content ) {
  return new Promise(function (resolve, reject) {
    $.clear( content, $.tag("h2", [_('chromatic-region')]) );
    var color = Color.instance;
    var cssColor;
    for( var k=0; k<CHROMATIC_REGIONS; k++ ) {
      color.H = k * INV_CHROMATIC_REGIONS;
      color.S = 1;
      color.L = .8;
      color.hsl2rgb();
      cssColor = color.stringify();
      $.add( content, createColorButton(
        cssColor, resolve
      ));
    }
  });
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
  console.info("[tfw.view.color-input] cssColor, luminance=", color, luminance);
  return luminance < .6 ? '#fff' : '#000';
}
