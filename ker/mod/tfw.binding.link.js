"use strict";

var PropertyManager = require("tfw.binding.property-manager");

var ID = 0;

/**
 * @export
 * @class Link
 * @param {object} args.src.obj - Source object holding properties.
 * @param {string} args.src.prop - Name of the source's property.
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
    onSrcChanged = actionChanged.bind( this, true, args, id, pmDst );
    pmSrc.on( args.src.prop, onSrcChanged );
  }
  if( args.src.open ) {
    onDstChanged = actionChanged.bind( this, false, args, id, pmSrc );
    pmDst.on( args.dst.prop, onDstChanged );
  }

  this.destroy = function() {
    if( onSrcChanged ) pmSrc.off( args.src.prop, onSrcChanged );
    if( onDstChanged ) pmDst.off( args.dst.prop, onDstChanged );
  };
};
/*

  var pm = PropertyManager( args.src.obj );
  pm.on( args.src.prop,  )*/

module.exports = Link;


function actionChanged( args, forward, id, pm, value, propertyName, container, tag ) {
  var src = forward ? args.src : args.dst;
  var dst = forward ? args.dst : args.src;

  // If the destination is closed, we don't care about source changes.
  if( !dst.open ) return;

  pm.change( dst.obj, dst.prop, value );
}


function checkArgs( args ) {
  if( typeof args === 'undefined' ) fail("Missing mandatory argument!");
  if( typeof args.src === 'undefined' ) fail("Missing `args.src`!");
  if( typeof args.src.obj === 'undefined' ) fail("Missing `args.src.obj`!");
  if( typeof args.src.prop === 'undefined' ) fail("Missing `args.src.prop`!");
  if( typeof args.src.open === 'undefined' ) args.src.open = true;
  if( typeof args.dst === 'undefined' ) fail("Missing `args.dst`!");
  if( typeof args.dst.obj === 'undefined' ) fail("Missing `args.dst.obj`!");
  if( typeof args.dst.prop === 'undefined' ) args.dst.prop = args.src.prop;
  if( typeof args.dst.open === 'undefined' ) args.dst.open = true;
}

function fail( msg, source ) {
  if( typeof source === 'undefined' ) {
    source = "";
  } else {
    source = "::" + source;
  }
  throw Error("[tfw.binding-link" + source + "] " + msg);
}
