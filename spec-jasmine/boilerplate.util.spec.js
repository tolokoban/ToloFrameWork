"use strict";

const Util = require( "../lib/boilerplate.util" );


describe( 'Module boilerplate.util', function () {
    describe( 'Function generateCode()', function () {
        [
            [
                [ "a" ], "a"
            ],
            [
                [ "a", [ "b", "c" ], "d" ], "a\n  b\n  c\nd"
            ],
            [
                [ "a", [ "b", [ "c" ] ], "d" ], "a\n  b\n    c\nd"
            ],
            [
                [ "a" ], "a", '  ', ''
            ],
            [
                [ "a", [ "b", "c" ], "d" ], "a\n  b\n  c\nd", '  ', ''
            ],
            [
                [ "a", [ "b", [ "c" ] ], "d" ], "a\n  b\n    c\nd", '  ', ''
            ]
        ].forEach( function ( item ) {
            var input = item[ 0 ];
            var expected = item[ 1 ];
            var indentIncrement = item[ 2 ];
            var currentIndent = item[ 3 ];
            it( 'should work for "' + JSON.stringify( input ) + '"', function () {
                var output = Util.generateCode( input, indentIncrement, currentIndent );
                if ( output !== expected ) {
                    fail( "\nExpected:\n" + expected + "\nBut found:\n" + output );
                }
            } );
        } );
    } );

    describe( 'Function isJavascriptIdentifier()', function () {
        [ "foo", "bar", "$", "_", "jedi26", "jedi_26", "Crum$ble" ].forEach( function ( name ) {
            it( `"${name}" should return true`, function () {
                expect( Util.isJavascriptIdentifier( name ) ).toBe( true );
            } );
        } );
        [ "!foo", "", "bar.", "garçon", "2hip" ].forEach( function ( name ) {
            it( `"${name}" should return false`, function () {
                expect( Util.isJavascriptIdentifier( name ) ).toBe( false );
            } );
        } );
    } );

    describe( 'Function att()', function () {
        [
            [ "toto", ".toto" ],
            [ "foo-bar", "[\"foo-bar\"]" ],
            [ 27, "[27]" ]
        ].forEach( function ( testCase ) {
            var inp = testCase[ 0 ];
            var exp = testCase[ 1 ];
            it( `att("${inp}") should return "${exp}"`, function () {
                expect( Util.att( inp ) ).toBe( exp );
            } );
        } );
    } );

    describe( 'Function isSpecial()', function () {
        [
            { toto: 666, 0: "a" },
            { toto: 666, "0": "a" },
            { 0: "yop" }
        ].forEach( function ( obj ) {
            it( 'should return `true` for ' + JSON.stringify( obj ), function () {
                expect( Util.isSpecial( obj ) ).toBe( true );
            } );
        } );

        [
            [ { toto: 666, 0: "a" }, 'a' ],
            [ { toto: 666, "0": "a" }, 'A' ],
            [ { 0: "yop" }, 'yop' ],
            [ { 0: "yop" }, 'YOP' ],
            [ { 0: "yop" }, 'yoP' ]
        ].forEach( function ( item ) {
            var obj = item[ 0 ];
            var expectedName = item[ 1 ];
            it( 'should return `true` when expectedName passed, for ' + JSON.stringify( obj ), function () {
                expect( Util.isSpecial( obj, expectedName ) ).toBe( true );
            } );
        } );

        [
            { toto: 666, "1": "a" },
            { toto: 666 },
            { bill: { 0: "yop" } }
        ].forEach( function ( obj ) {
            it( 'should return `false` for ' + JSON.stringify( obj ), function () {
                expect( Util.isSpecial( obj ) ).toBe( false );
            } );
        } );
    } );

    describe( 'Function cap()', function () {
        [
            [ 666, 666 ],
            [
                [ 666, "q" ]
            ],
            [ "h", "H" ],
            [ "W", "W" ],
            [ "", "" ],
            [ "paRis", "Paris" ],
            [ "paris", "Paris" ]
        ].forEach( function ( item ) {
            var input = item[ 0 ];
            var expected = item[ 1 ];
            if ( typeof expected === 'undefined' ) expected = input;
            it( '"' + input + '" should return "' + expected + "'", function () {
                expect( Util.cap( input ) ).toBe( expected );
            } );
        } );
    } );

    describe( 'Function camel()', function () {
        [
            [ "John", "john" ],
            [ "super-bad-guy", "superBadGuy" ],
            [ "SUPER-bad-guy", "superBadGuy" ],
            [ "super-BAD-guy", "superBadGuy" ],
            [ "Super-bad-guy", "superBadGuy" ],
            [ "suPEr-bad-guy", "superBadGuy" ],
            [ "", "" ]
        ].forEach( function ( item ) {
            var input = item[ 0 ];
            var expected = item[ 1 ];
            if ( typeof expected === 'undefined' ) expected = input;
            it( '"' + input + '" should return "' + expected + "'", function () {
                expect( Util.camel( input ) ).toBe( expected );
            } );
        } );
    } );
} );