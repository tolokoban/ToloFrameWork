var TreeWalker = require("../lib/tree-walker");

describe('TreeWalker', function() {
    function X(out, chr) {
        if( typeof chr === 'undefined' ) {
            return (function( node, path ){
                out.txt += JSON.stringify( node );
            });
        }
        var f = function() {
            out.txt += chr;
        };
        return f;
    }

    var data = {
        weapon: [
            { gender: "F", name: "Sword" },
            { gender: "F", name: "Pike" },
            { gender: "M", name: "Bow" }
        ],
        races: {
            human: [
                { gender: "M", name: "John" },
                { gender: "M", name: "Tyron" },
                { gender: "F", name: "Arya" },
                { gender: "F", name: "Cercey" },
                { gender: "F", name: "Sansa" },
                { gender: "M", name: "Tywin" },
            ],
            monster: [
                { gender: "F", name: "Dragon" },
                { gender: "M", name: "Troll" },
                { gender: "M", name: "Gobelin" }
            ]
        }
    };

    it('should get the names of all males', function() {
        var out = {txt: ''};
        TreeWalker.create({ '**/[gender=M]/name': X(out) }).walk( data );
        expect( out.txt ).toBe( '"Bow""John""Tyron""Tywin""Troll""Gobelin"' );
    });

    it('should traverse all nodes with `**`', function() {
        var out = {txt: ''};
        TreeWalker.create({ '**': X(out) }).walk( data );
        expect( out.txt ).toBe( '"F""Sword""F""Pike""M""Bow""M""John""M""Tyron""F""Arya""F""Cercey""F""Sansa""M""Tywin""F""Dragon""M""Troll""M""Gobelin"' );
    });

});
