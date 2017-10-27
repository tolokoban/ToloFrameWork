"use strict";

var Finder = require("../lib/dependencies-finder");

jasmine.DEFAULT_TIMEOUT_INTERVAL = 3600000;


describe('Module "dependencies-finder"', function() {
  it('should find requires', function() {
    debugger;
    var result = Finder(FILE1);
    expect(result.requires).toEqual([
      'tfw.binding.converters', 'tfw.binding.property-manager'
    ]);
  });

});



var FILE1 = `/** @module tfw.binding */require( 'tfw.binding', function(require, module, exports) { var _=function(){return ''};    "use strict";

var Converters = require("tfw.binding.converters");
var PropertyManager = require("tfw.binding.property-manager");


exports.defProps = function( obj, props ) {
  var propertyName;
  for( propertyName in props ) {
    exports.defProp( obj, propertyName, props[propertyName] );
  }
};


/**
 * @param {function(v)} opts.cast
 */
exports.defProp = function( obj, name, opts ) {
  if( typeof opts === 'undefined' ) opts = {};
  var pm = PropertyManager( obj );
  pm.converter( name, exports.createConverter( opts.cast ) );

  Object.defineProperty( obj, name, {
    set: pm.change.bind( pm, name ),
    get: pm.get.bind( pm, name ),
    configurable: false,
    enumerable: true
  });
};


exports.createConverter = function( arg ) {
  var type = typeof arg;
  switch( type ) {
  case 'function':
    return arg;
  case 'string':
    return Converters.get( arg );
  default:
    return undefined;
  }
};



module.exports._ = _;
});
`;
