var JSDoc = require("../lib/jsdoc");


describe('JSDoc', function() {
    describe('stripComments', function() {
        it('should deal with single line', function() {
            expect( JSDoc.stripComments( '/*Mono-line*/' ) ).toBe( 'Mono-line' );
        });

        it('should deal with single line with two stars', function() {
            expect( JSDoc.stripComments( '/** Mono-line */' ) ).toBe( 'Mono-line' );
        });

        it('should deal with MarkDown bullets', function() {
            var result = JSDoc.stripComments(
                "/** \n"
                    + " * Comment ça va?\n"
                    + " * Comme ci, comme ci, comme ci, comme ça.\n"
                    + " * * Red\n"
                    + " * * Green\n"
                    + " * * Blue\n"
                    + " * That's all, folks!\n"
                    + " */"
            );
            expect( result ).toBe(
                "Comment ça va?\n"
                    + "Comme ci, comme ci, comme ci, comme ça.\n"
                    + "* Red\n"
                    + "* Green\n"
                    + "* Blue\n"
                    + "That's all, folks!"
            );
        });

        it('should deal with several indentations', function() {
            var result = JSDoc.stripComments(
                "/** \n"
                    + " * Comment ça va?\n"
                    + " * Comme ci, comme ci, comme ci, comme ça.\n"
                    + " * * Red\n"
                    + " *     * Green\n"
                    + " *     * Blue\n"
                    + " * That's all, folks!\n"
                    + " */"
            );
            expect( result ).toBe(
                "Comment ça va?\n"
                    + "Comme ci, comme ci, comme ci, comme ça.\n"
                    + "* Red\n"
                    + "    * Green\n"
                    + "    * Blue\n"
                    + "That's all, folks!"
            );            
        });

    });
});
