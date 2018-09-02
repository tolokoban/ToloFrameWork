/**
 * Here are the tags used by a CSS source:
 * * __`debug`__: (string) CSS code after LESS expansion.
 * * __`release`__: (string) CSS LESS expanded code after zip.
 * * __`resources`__: (array) resources referenced by this CSS: images, fonts, ...
 * @module compiler-css
 */

var FS = require("fs");
var Path = require("path");
var Util = require("./util");
//var Vars = require('rework-vars');
var Rework = require('rework');

/**
 * @todo Parse the `release` looking for `url(...)` in order to list all resources.
 */
module.exports.compile = function(source) {
  if (source.isUptodate()) return false;
  console.log("Compiling CSS " + source.name().yellow);
  var content = source.read();
  //var multiBrowserContent = Rework( content ).use( Vars({}) ).toString();
  var multiBrowserContent = Rework( content ).use().toString();
  var debug = multiBrowserContent;
  var release = Util.zipCSS(multiBrowserContent).styles;
  source.tag("debug", debug);
  source.tag("release", release);
  source.save();
};

/**
 * Macro processing for CSS.
 *
 * This code:
 * ```
 * <mac:keyframes name="my_anim">
 * @keyframes {{name}} {{{@}}}
 * @-webkit-keyframes {{name}} {{{@}}}
 * </mac:frames>
 *
 * <keyframes name="horizontal-slide">
 *   from { margin-left: 100%; }
 *   to { margin-left: 0%; }
 * </mac:frames>
 * ```
 *
 * will give this result:
 * ```
 * @keyframes horizontal-slide {
 *   from { margin-left: 100%; }
 *   to { margin-left: 0%; }
 * }
 * @-webkit-keyframes horizontal-slide {
 *   from { margin-left: 100%; }
 *   to { margin-left: 0%; }
 * }
 * ```
 */
module.exports.macroCSS = function(content, macros) {
  if (typeof macros === 'undefined') macros = {};


}
