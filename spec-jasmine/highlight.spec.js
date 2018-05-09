var Highlight = require("../ker/com/x-code/highlight").parseCode;
var Tree = require("../lib/htmltree");

function span( cls, txt ) {
  return '<span class="' + cls + '">' + txt + "</span>";
}

describe('Highlight', function() {
  function chk(code, expected) {
    var result = Highlight( code, 'js', { Tree: Tree } );
    
    result = result.substr( "<pre class='custom highlight js'>".length );
    result = result.substr( 0, result.length - '</pre>'.length ).trimRight();
    if (result != expected) {
      console.log("========================================");
      console.log("EXP>", expected);
      console.log("GOT>", result);
      console.log("----------------------------------------");
    }
    expect( result ).toEqual( expected );
  }
  
  describe('for Javascript', function() {
    it('should parse keywords', function() {
      chk( "var", span( 'keyword', 'var' ) );
      chk( "return", span( 'keyword', 'return' ) );
      chk( "switch", span( 'keyword', 'switch' ) );
      chk( "returned", span( 'identifier', 'returned' ) );
    });
    it('should parse simple lines', function() {
      chk( "var PI=3.14159", 
        span( 'keyword', 'var' ) + " " +
        span( 'identifier', 'PI' ) +
        span( 'operator', '=' ) +
        span( 'number', '3.14159' ) );
    });
    it('should deal with quotes in comments', function() {
      chk( "// C'est beau.", span('comment', "// C'est beau. ") );
    });
    it('should deal with comments before lines', function() {
      chk( "// Temps en millisecondes.\nuniform float uniTime;", 
        span('comment', "// Temps en millisecondes.") + "\n" +
        span('identifier', 'uniform') + " " +
        span('identifier', 'float') + " " +
        span('identifier', 'uniTime') +
        span('symbol', ';'));
    });
    it('should deal with simple quotes', function() {
      chk( "a = 'toto';", 
        span('identifier', 'a') + ' ' +
        span('operator', '=') + ' ' +
        span('string', "'toto'") +
        span('symbol', ';'));
    });
  });
});
