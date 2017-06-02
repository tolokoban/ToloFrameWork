var Highlight = require("./ker/com/x-code/highlight").parseCode;

var code = "var";

var result = Highlight( code, 'js', {
  Tree: require("./lib/htmltree")
} );
console.log( result );

