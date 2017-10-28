"use strict";

var PropertyManager = require("tfw.binding.property-manager");

var ID = 0;

/**
 * @export
 * @class Link
 * @param {object} args.src.obj - Source object holding properties.
 * @param {string} args.src.name - Name of the source's property.
 * @param  {function=undefined}  args.src.converter  -  Converter  for
 * values entering the source.
 * @param  {function=undefined} args.src.filter  -  Filter for  values
 * entering the source. If the filter returns `false` the value is not
 * set to the source.
 * @param {boolean=true}  args.src.open -  If false,  no data  will be
 * received on source.
 */
var Link = function( args ) {
  checkArgs( args );

  var id = ID++;
  var pmSrc = PropertyManager( args.src.obj );
  var pmDst = PropertyManager( args.dst.obj );
  var onSrcChanged, onDstChanged;

  if( args.dst.open ) {
    onSrcChanged = actionChanged.bind( this, true, args, id );
    pmSrc.on( args.src.name, onSrcChanged );
  }
  if( args.src.open ) {
    onDstChanged = actionChanged.bind( this, false, args, id );
    pmDst.on( args.dst.name, onDstChanged );
  }

  this.destroy = function() {
    if( onSrcChanged ) pmSrc.off( args.src.name, onSrcChanged );
    if( onDstChanged ) pmDst.off( args.dst.name, onDstChanged );
  };
};


module.exports = Link;


function actionChanged( forward, args, id, value, propertyName, container, wave ) {
  var src = forward ? args.src : args.dst;
  var dst = forward ? args.dst : args.src;
  var pmSrc = PropertyManager( src.obj );
  var pmDst = PropertyManager( dst.obj );

  // If the destination is closed, we don't care about source changes.
  if( !dst.open ) return;

  if( typeof dst.converter === 'function' ) {
    try {
      value = dst.converter( value );
    }
    catch( ex ) {
      console.error( ex );
      fail( 
        "Error in converter of link "
        + PropertyManager(src.obj) + "." + src.name
        + " -> "
        + PropertyManager(dst.obj) + "." + dst.name + "!"
      );
    }
  }

  if( Array.isArray( wave ) ) {
    if( wave.indexOf( id ) < 0 ) {
      // Remember we took this path.
      wave.push( id );
    } else {
      // We already took this link in this wave.
      return;
    }
  } else {
    wave = [id];
  }
  pmDst.change( dst.name, value, wave );
}


function checkArgs( args ) {
  if( typeof args === 'undefined' ) fail("Missing mandatory argument!");
  if( typeof args.src === 'undefined' ) fail("Missing `args.src`!");
  if( typeof args.src.obj === 'undefined' ) fail("Missing `args.src.obj`!");
  if( typeof args.src.name === 'undefined' ) fail("Missing `args.src.name`!");
  if( typeof args.src.open === 'undefined' ) args.src.open = true;
  if( typeof args.dst === 'undefined' ) fail("Missing `args.dst`!");
  if( typeof args.dst.obj === 'undefined' ) fail("Missing `args.dst.obj`!");
  if( typeof args.dst.name === 'undefined' ) args.dst.name = args.src.name;
  if( typeof args.dst.open === 'undefined' ) args.dst.open = true;
  if( args.src.obj === args.dst.obj ) 
    fail("Source and destination objects must be different!");
}

function fail( msg, source ) {
  if( typeof source === 'undefined' ) {
    source = "";
  } else {
    source = "::" + source;
  }
  throw Error("[tfw.binding.link" + source + "] " + msg);
}
