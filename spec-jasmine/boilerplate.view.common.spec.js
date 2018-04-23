"use strict";

var Common = require("../lib/boilerplate.view.common");


describe('[boilerplate.view.common', function() {
  describe('camelCase', function() {
    var check = function( given, expected ) {
      it('should convert ' + JSON.stringify(given) + " into " + JSON.stringify(expected),
         function() {
           expect( Common.camelCase(given) ).toBe( expected );
         });
    };
    check( "verbatim", "verbatim" );
    check( "textContent", "textContent" );
    check( "tfw.view.button", "tfwViewButton" );
    check( "tfw-view-button", "tfwViewButton" );
    check( "tfw-view.button", "tfwViewButton" );
    check( "tfw.view.button", "tfwViewButton" );
  });

  describe('CamelCase', function() {
    var check = function( given, expected ) {
      it('should convert ' + JSON.stringify(given) + " into " + JSON.stringify(expected),
         function() {
           expect( Common.CamelCase(given) ).toBe( expected );
         });
    };
    check( "verbatim", "Verbatim" );
    check( "textContent", "TextContent" );
    check( "tfw.view.button", "TfwViewButton" );
    check( "tfw-view-button", "TfwViewButton" );
    check( "tfw-view.button", "TfwViewButton" );
    check( "tfw.view.button", "TfwViewButton" );
  });
});
