"use strict";

const
Path = require("path"),
Module = require( "../lib/module" );


describe('Module "Module"', function() {
    it('should compute correct pathes', function() {
        const module = new Module( "tfw.view.textbox", "support/module/data/srcA/" );
        expect(module.pathJs).toEqual(
            Path.resolve( ".", "support/module/data/srcA/mod/tfw/view/textbox.js" ) );
    });
});
