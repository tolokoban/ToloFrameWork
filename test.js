var TreeWalker = require("./lib/tree-walker");
var JSDoc = require("./lib/jsdoc");
var FS = require("fs");

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


var out = {txt: ''};
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
var T = new TreeWalker({
    '**': X(out)
});

T.walk( data );

console.log(out.txt);

/*
 var code = FS.readFileSync( 'ker/mod/wdg.js' ).toString();
 console.log("---AAA---");
 var result = JSDoc.parseDoc( code );
 console.log("---BBB---");
 console.log(result);
 */
