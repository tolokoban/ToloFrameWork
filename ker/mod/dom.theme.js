"use strict";
/**
 * Manage material design like CSS styles.
 */
exports.register = registerTheme;
exports.apply = applyTheme;


//################################################################################


var Color = require("tfw.color");

var THEME_COLOR_NAMES = ["0", "1", "2", "3", "P", "PD", "PL", "S", "SD", "SL"];
var THEMES = {
  css: {},
  current: null
};



function registerTheme( themeName, style ) {
  style = completeWithDefaultValues( style );

  var codeCSS = codeVariables( themeName, style );
  codeCSS += codeBackground( themeName, style );
  codeCSS += codeElevation( themeName, style );
  codeCSS += codeText( themeName, style );

  var styleElement = THEMES.css[themeName];
  if( !styleElement ) {
    styleElement = document.createElement("style");
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
      var fgClass = ".thm-fg" + colorName;
      for( var position = 1; position <= depth; position++ ) {
        var piecesFG = [];
        var piecesSVG = [];
        var piecesBG = [];
        for( var index = 1; index <= depth; index++ ) {
          piecesBG.push( position === index ? bgClass : '*' );
          piecesSVG.push( position === index ? bgClass : '*' );
          piecesFG.push( position === index ? fgClass : '*' );
          if( index === depth ) {
            piecesBG.push( piecesBG.pop() + ".thm-fg" );
            piecesFG.push( piecesFG.pop() + fgClass );
          }
        }
        codeCSS += "body.dom-theme-" + themeName + " "
          + piecesBG.join( " > " )
          + " { color: " + style['fg' + colorName] + " }\n";
        codeCSS += "body.dom-theme-" + themeName + " "
          + piecesFG.join( " > " )
          + " { color: " + style['bg' + colorName] + " }\n";
        codeCSS += "body.dom-theme-" + themeName + " "
          + piecesSVG.join( " > " )
          + " .thm-svg-fill0"
          + " { fill: " + style['fg' + colorName] + " }\n";
        codeCSS += "body.dom-theme-" + themeName + " "
          + piecesSVG.join( " > " )
          + " .thm-svg-stroke0"
          + " { stroke: " + style['fg' + colorName] + " }\n";
      }
    });
  }
  return codeCSS;
}

function codeVariables( themeName, style ) {
  var codeCSS = "body.dom-theme-" + themeName + '{\n';
  THEME_COLOR_NAMES.forEach(function (colorName) {
    codeCSS += "  --thm-bg" + colorName + ": " + style['bg' + colorName] + ";\n";
  });
  codeCSS += "}\n";
  return codeCSS;
}


function codeBackground( themeName, style ) {
  var codeCSS = '';
  THEME_COLOR_NAMES.forEach(function (colorName) {
    codeCSS += "body.dom-theme-" + themeName + ".thm-bg" + colorName
      + " { background-color: " + style['bg' + colorName] + " }\n";
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
    codeCSS += "body.dom-theme-" + themeName + " .thm-svg-fill" + colorName
      + " { fill: "
      + style['bg' + colorName] + " }\n";
    codeCSS += "body.dom-theme-" + themeName + " .thm-svg-stroke" + colorName
      + " { stroke: "
      + style['bg' + colorName] + " }\n";
  });
  return codeCSS;
}

function codeElevation( themeName, style ) {
  var luminance = Color.luminance( style.bg2 );
  var elevationColor = luminance < .6
        ? addAlpha(style.white, Math.ceil(10 * luminance)) : addAlpha(style.black, '6');
  var codeCSS = '';
  [0,1,2,3,4,6,8,9,12,16,24].forEach(function (elevation) {
    codeCSS += "body.dom-theme-" + themeName + " .thm-ele" + elevation + " {\n"
      + "  box-shadow: 0 " + elevation + "px " + (2 * elevation) + "px " + elevationColor + "\n"
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
  if( typeof style.bgPL !== 'string' ) style.bgPL = light( style.bgP );
  if( typeof style.bgS !== 'string' ) style.bgS = "#FF3F80";
  if( typeof style.bgSD !== 'string' ) style.bgSD = dark( style.bgS );
  if( typeof style.bgSL !== 'string' ) style.bgSL = light( style.bgS );

  if( typeof style.white === 'undefined' ) style.white = '#fff';
  if( typeof style.black === 'undefined' ) style.black = '#000';


  THEME_COLOR_NAMES.forEach(function (name) {
    var bg = style['bg' + name];
    var luminance = Color.luminance( bg );
    style['fg' + name] = luminance < .6 ? style.white : style.black;
  });

  return style;
}

function dark( color ) {
  var percent = .25;
  var darkColor = new Color( color );
  darkColor.rgb2hsl();
  darkColor.L *= 1 - percent;
  darkColor.hsl2rgb();
  return darkColor.stringify();
}

function light( color ) {
  var percent = .4;
  var lightColor = new Color( color );
  lightColor.rgb2hsl();
  lightColor.L = percent + (1 - percent) * lightColor.L;
  lightColor.hsl2rgb();
  return lightColor.stringify();
}


/**
 * @param {string} color - RGB color in format #xxx or #xxxxxx.
 * @param {string} alpha - Single char between 0 and F.
 */
function addAlpha( color, alpha ) {
  if( color.length < 5 ) return color + alpha;
  return color + alpha + alpha;
}
