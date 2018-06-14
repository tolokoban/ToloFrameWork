"use strict";

module.exports = function( moduleName ) {
  this.moduleName = moduleName;
  /**
   * Here is the skeleton of the code generated for a View.
   * All the sections are marked as comments.
   * 
   * try {
   *   module.exports = function() {
   *     // <requires>
   *     // <functions>
   *     // <variables>
   *     // <converters>
   *     // <templates>
   *     return function( args ) {
   *       try {
   *         // <view:attributes>
   *         // <view:elements>
   *         // <view:links>
   *         // <view.initElements>
   *         // <view.initAttributes>
   *       } catch...
   *     };
   *   }
   * } catch...
   */
  this.sections = {
    requires: [],
    functions: [],
    variables: [],
    converters: [],
    templates: []
  };
};
