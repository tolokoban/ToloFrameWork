"use strict";

var Color = require("tfw.color");


describe('tfw.color', function() {
  describe('parse()', function() {
    var cases = [
      ["#fff", 1, 1, 1, 1],
      ["#ffff", 1, 1, 1, 1],
      ["#ffffff", 1, 1, 1, 1],
      ["#ffffffff", 1, 1, 1, 1],
      ["#000", 0, 0, 0, 1],
      ["#0000", 0, 0, 0, 0],
      ["#000000", 0, 0, 0, 1],
      ["#00000000", 0, 0, 0, 0],
      ["#CD9", .8, .8667, .6, 1],
      ["#B4440129", 0xB4/255, 0x44/255, 0x01/255, 0x29/255],
      ["#B44401", 0xB4/255, 0x44/255, 0x01/255, 1],
      ["rgb(127, 240, 44)", 127/255, 240/255, 44/255, 1],
      ["rgb   (17, 240, 44)", 17/255, 240/255, 44/255, 1],
      ["rgb ( 127, 20, 44)", 127/255, 20/255, 44/255, 1],
      ["rgb(27,240,44)", 27/255, 240/255, 44/255, 1],
      ["rgb (127,  240, 144", 127/255, 240/255, 144/255, 1],
      ["rgba(100,200,50,0.33)", 100/255, 200/255, 50/255, 0.33]
    ];
    cases.forEach(function (singleCase) {
      var text = singleCase[0];
      var R = singleCase[1].toFixed( 4 );
      var G = singleCase[2].toFixed( 4 );
      var B = singleCase[3].toFixed( 4 );
      var A = singleCase[4].toFixed( 4 );
      it(`should return true for ${text}`, function() {
        var color = new Color();
        expect( color.parse( text ) ).toBe( true );
      });
      it(`should find (${R}, ${G}, ${B}) from ${text}`, function() {
        var color = new Color();
        color.parse( text );
        var rr = color.R.toFixed( 4 );
        var gg = color.G.toFixed( 4 );
        var bb = color.B.toFixed( 4 );
        var aa = color.A.toFixed( 4 );
        expect([ rr, gg, bb, aa ]).toEqual([ R, G, B, A ]);
      });
    });
  });
});
