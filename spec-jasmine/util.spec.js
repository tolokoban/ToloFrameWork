"use strict";

const
    Path = require( "path" ),
    Util = require( "../lib/util" );

describe( 'Module util', () => {
    describe( 'function replaceDotsWithSlashes', () => {

        /**
         * Check if the input produces what was expected.
         *
         * @param   {string} input - File name with full path.
         * @param   {string} expected - What was expected.
         * @returns {undefined}
         */
        function check( input, expected ) {
            const output = Util.replaceDotsWithSlashes( input );
            expect( output ).toBe( expected.split( '/' ).join( Path.sep ) );
        }

        it( 'should not change modules without dots in the name', function () {
            check( "foo/bar/my-super-module.js", "foo/bar/my-super-module.js" );
        } );
        it( 'should change modules with dots in the name', function () {
            check( "foo/bar/my.super.module.js", "foo/bar/my/super/module.js" );
        } );
        it( 'should return non-strings verbatim', function () {
            expect( Util.replaceDotsWithSlashes( null ) ).toBe( null );
            expect( Util.replaceDotsWithSlashes( 3.14 ) ).toBe( 3.14 );
        } );
    } );
} );