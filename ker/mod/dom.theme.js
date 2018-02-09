"use strict";
/**
 * Manage material design like CSS styles.
 */

var Color = require("tfw.color");

var THEME_COLOR_NAMES = ["0", "1", "2", "3", "P", "PD", "PL", "S", "SD", "SL"];
var THEMES = {
  css: {},
  current: null
};



exports.register = registerTheme;
exports.apply = applyTheme;


function registerTheme( themeName, style ) {
  style = completeWithDefaultValues( style );

  var codeCSS = codeBackground( themeName, style );
  codeCSS += codeElevation( themeName, style );
  codeCSS += codeText( themeName, style );

  var styleElement = THEMES.css[themeName];
  if( !styleElement ) {
    styleElement = document.createElement("style");
    console.info("[dom] document.body=", document.body);
    console.info("[dom] document.querySelector['head']=", document.getElementsByTagName( 'head' )[0]);
    document.getElementsByTagName( 'head' )[0].appendChild( styleElement );
    THEMES.css[themeName] = styleElement;
  }

  styleElement.textContent = codeCSS;

  return this;
}

function codeText( themeName, style ) {
  var codeCSS = '';
  for( var depth = 1; depth <= 10; depth++ ) {
    THEME_COLOR_NAMES.forEach(function (colorName) {
      var bgClass = ".thm-bg" + colorName;
      for( var position = 1; position <= depth; position++ ) {
        var pieces = [];
        for( var index = 1; index <= depth; index++ ) {
          pieces.push( position === index ? bgClass : '*' );
        }
        codeCSS += "body.dom-theme-" + themeName + " "
          + pieces.join( " > " )
          + " { color: " + style['fg' + colorName] + " }\n";
        codeCSS += "body.dom-theme-" + themeName + " "
          + pieces.join( " > " )
          + " svg .thm-svg-fill0"
          + " { fill: " + style['fg' + colorName] + " }\n";
      }
    });
  }
  return codeCSS;
}

function codeBackground( themeName, style ) {
  var codeCSS = '';
  THEME_COLOR_NAMES.forEach(function (colorName) {
    codeCSS += "body.dom-theme-" + themeName + " .thm-fg" + colorName
      + " { color: " + style['fg' + colorName] + " }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-bg" + colorName
      + " { background-color: " + style['bg' + colorName] + " }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-bg" + colorName + "-bottom"
      + " { background: linear-gradient(to top,"
      + style['bg' + colorName] + ",transparent) }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-bg" + colorName + "-top"
      + " { background: linear-gradient(to bottom,"
      + style['bg' + colorName] + ",transparent) }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-bg" + colorName + "-left"
      + " { background: linear-gradient(to right,"
      + style['bg' + colorName] + ",transparent) }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-bg" + colorName + "-right"
      + " { background: linear-gradient(to left,"
      + style['bg' + colorName] + ",transparent) }\n";
    
    if( !isNaN(parseInt(colorName)) ) return;
    codeCSS += "body.dom-theme-" + themeName + " svg .thm-svg-fill" + colorName
      + " { fill: "
      + style['bg' + colorName] + " }\n";
  });
  return codeCSS;
}

function codeElevation( themeName, style ) {
  var luminance = Color.luminance( style.bg2 );
  var elevationColor = luminance < .6 ? '#fff' + Math.ceil(10 * luminance) : '#0006';
  var codeCSS = '';
  [0,1,2,3,4,6,8,9,12,16,24].forEach(function (elevation) {
    codeCSS += "body.dom-theme-" + themeName + " .thm-ele" + elevation + " {\n"
      + "  box-shadow: 0 " + elevation + "px " + (2 * elevation) + "px " + elevationColor + "\n"
      + "  transition: box-shadow .2s;\n"
      + "}\n";
  });
  return codeCSS;
}

function applyTheme( name, target ) {
  if( typeof target === 'undefined' ) target = document.body;

  if( !THEMES.css[name] ) {
    console.error( "This theme has not been registered: ", name );
    return;
  }
  var body = document.body;
  if( typeof THEMES.current === 'string' ) {
    this.removeClass( body, "dom-theme-" + THEMES.current );
  }
  THEMES.current = name;
  this.addClass( body, "dom-theme-" + THEMES.current );
}

function completeWithDefaultValues( style ) {
  if( typeof style === 'undefined' ) style = {};
  if( typeof style.bg0 !== 'string' ) style.bg0 = "#E0E0E0";
  if( typeof style.bg1 !== 'string' ) style.bg1 = "#F5F5F5";
  if( typeof style.bg2 !== 'string' ) style.bg2 = "#FAFAFA";
  if( typeof style.bg3 !== 'string' ) style.bg3 = "#FFF";

  if( typeof style.bgP !== 'string' ) style.bgP = "#3E50B4";
  if( typeof style.bgPD !== 'string' ) style.bgPD = dark( style.bgP );
  if( typeof style.bgPL !== 'string' ) style.bgPL = dark( style.bgP );
  if( typeof style.bgS !== 'string' ) style.bgS = "#FF3F80";
  if( typeof style.bgSD !== 'string' ) style.bgSD = dark( style.bgS );
  if( typeof style.bgSL !== 'string' ) style.bgSL = dark( style.bgS );

  THEME_COLOR_NAMES.forEach(function (name) {
    var bg = style['fg' + name];
    if( typeof bg === 'string' ) return;
    var luminance = Color.luminance( bg );
    style['fg' + name] = luminance < .6 ? '#fff' : '#000';
  });

  return style;
}

function dark( color ) {
  var percent = .25;
  var darkColor = color.copy();
  darkColor.rgb2hsl();
  darkColor.L *= 1 - percent;
  darkColor.hsl2rgb();
  return darkColor;
}

function light( color ) {
  var percent = .4;
  var lightColor = color.copy();
  lightColor.rgb2hsl();
  lightColor.L = percent + (1 - percent) * lightColor.L;
  lightColor.hsl2rgb();
  return lightColor;
}
