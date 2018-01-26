"use strict";

var PM = require("tfw.binding.property-manager");
var Link = require("tfw.binding.link");


describe('Module tfw.binding.link', function() {
  it('should propagate new value of first property to the third', function() {
    var obj1 = {};
    PM( obj1 ).create( "x" );
    var obj2 = {};
    PM( obj2 ).create( "y" );
    var obj3 = {};
    PM( obj3 ).create( "z" );

    new Link({
      A:{ obj:obj1, name:"x" },
      B:{ obj:obj2, name:"y" }
    });
    new Link({
      A:{ obj:obj2, name:"y" },
      B:{ obj:obj3, name:"z" }
    });

    obj1.x = 27;
    expect( obj3.z ).toBe( 27 );
  });

  it('should use converter', function() {
    var obj1 = {};
    PM( obj1 ).create( "x" );
    var obj2 = {};
    PM( obj2 ).create( "y" );

    new Link({
      A:{ obj:obj1, name:"x" },
      B:{ obj:obj2, name:"y", converter: v => 2*v }
    });

    obj1.x = 27;
    expect( obj2.y ).toBe( 54 );
  });

  it('should use converter and prevent retroaction', function() {
    var obj1 = {};
    PM( obj1 ).create( "x" );
    var obj2 = {};
    PM( obj2 ).create( "y" );

    new Link({
      A:{ obj:obj1, name:"x" },
      B:{ obj:obj2, name:"y", converter: v => 2*v }
    });

    obj1.x = 27;
    expect( obj2.y ).toBe( 54 );
    expect( obj1.x ).toBe( 27 );    
  });

});

