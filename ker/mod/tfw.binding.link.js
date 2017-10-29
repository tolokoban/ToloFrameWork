"use strict";

var PropertyManager = require("tfw.binding.property-manager");

var ID = 0;

/**
 * @export
 * @class Link
 * @param {object} args.src.obj - Source object holding properties.
 * @param {string} args.src.name - Name of the source's property.
 * @param {string=undefined} args.src.value -  If specified, it is the
 * value to propagate to the dst.
 * @param  {function=undefined}  args.src.value  -  If  `value`  is  a
 * function, it will be called  with the propertyName as sole argument
 * and the return will be sent to dst.
 * @param  {function=undefined}  args.src.converter  -  Converter  for
 * values entering the source.
 * @param  {function=undefined} args.src.filter  -  Filter for  values
 * entering the source. If the filter returns `false` the value is not
 * set to the source.
 * @param   {string|array}  args.src.switch   -  Sometimes,   you  are
 * listening at  a property  A to  change, but  want to  propagate the
 * value  of  B. It  is  usefull  with  buttons which  provide  action
 * properties.
 * So this attribute  tells teh link what property to  read instead of
 * the one  we are  listening on.  Moreover, if you  give an  array of
 * property names, the  value will be an array with  the values of all
 * asked properties.
 * @param {boolean=true}  args.src.open -  If false,  no data  will be
 * sent to destination.
 */
var Link = function( args ) {
  checkArgs( args );

  var id = ID++;
  var onSrcChanged = linkToSrc( args, id );
  var onDstChanged = linkToDst( args, id );
  addDestroyFunction.call( this, onSrcChanged, onDstChanged );
};


module.exports = Link;


function linkToDst( args, id ) {
  var onSrcChanged = [];
  args.dst.forEach(function (dst, dstIndex) {
    if( !dst.open ) return;
    var pmDst = PropertyManager( dst.obj );
    args.src.forEach(function (src, srcIndex) {
      if( src.obj === dst.obj && src.name === dst.name ) {
        console.error(
          "It is forbidden to link a property on itself! (" + srcIndex + " -> " + dstIndex + ")"
        );
        console.info("[tfw.binding.link] args=", args);
        return;
      }
      var pmSrc = PropertyManager( src.obj );
      var slot = actionChanged.bind( this, src, dst, id );
      pmSrc.on( src.name, slot );
      onSrcChanged.push({ pm: pmSrc, name: src.name, slot: slot });
    });
  });
  return onSrcChanged;
}

function linkToSrc( args, id ) {
  var onDstChanged = [];
  args.src.forEach(function (src, dstIndex) {
    if( !src.open ) return;
    var pmSrc = PropertyManager( src.obj );
    args.dst.forEach(function (dst, srcIndex) {
      if( src.obj === dst.obj && src.name === dst.name ) {
        console.error(
          "It is forbidden to link a property on itself! (" + srcIndex + " <- " + dstIndex + ")"
        );
        console.info("[tfw.binding.link] args=", args);
        return;
      }
      var pmDst = PropertyManager( dst.obj );
      var slot = actionChanged.bind( this, dst, src, id );
      pmDst.on( dst.name, slot );
      onDstChanged.push ({pm: pmDst, name: dst.name, slot: slot });
    });
  });
  return onDstChanged;
}

function addDestroyFunction( onSrcChanged, onDstChanged ) {
  this.destroy = function() {
    onSrcChanged.forEach(function (item) {
      item.pm.off( item.name, item.slot );
    });
    onDstChanged.forEach(function (item) {
      item.pm.off( item.name, item.slot );
    });
  };
}

function actionChanged( src, dst, id, value, propertyName, container, wave ) {
  var pmSrc = PropertyManager( src.obj );
  var pmDst = PropertyManager( dst.obj );

  if( hasAlreadyBeenHere( id, wave ) ) return;

  value = processValue( value, src, dst );
  value = processSwitch( value, dst, pmSrc );
  value = processConverter( value, src, dst );
  if( filterFailed( value, src, dst ) ) return;

  if( typeof dst.delay === 'number' ) {
    clearTimeout( dst._id );
    dst._id = setTimeout(function() {
      pmDst.change( dst.name, value, wave );
    }, src.delay);
  } else {
    pmDst.change( dst.name, value, wave );
  }
}


function checkArgs( args ) {
  if( typeof args === 'undefined' ) fail("Missing mandatory argument!");
  if( typeof args.src === 'undefined' ) fail("Missing `args.src`!");
  if( !Array.isArray( args.src ) ) args.src = [args.src];
  if( typeof args.dst === 'undefined' ) fail("Missing `args.dst`!");
  if( !Array.isArray( args.dst ) ) args.dst = [args.dst];

  var k;
  for( k = 0 ; k < args.src.length ; k++ ) {
    checkPod( args.src[k], k );
  }
  for( k = 0 ; k < args.src.length ; k++ ) {
    checkPod( args.dst[k], k );
  }
}

function checkPod( pod, index ) {
  if( typeof pod.obj === 'undefined' ) fail("Missing `[" + index + "].obj`!");
  if( typeof pod.name === 'undefined' ) fail("Missing `[" + index + "].name`!");
  if( typeof pod.open === 'undefined' ) pod.open = true;
}


function fail( msg, source ) {
  if( typeof source === 'undefined' ) {
    source = "";
  } else {
    source = "::" + source;
  }
  throw Error("[tfw.binding.link" + source + "] " + msg);
}


function hasAlreadyBeenHere( id, wave ) {
  if( Array.isArray( wave ) ) {
    if( wave.indexOf( id ) < 0 ) {
      // Remember we took this path.
      wave.push( id );
    } else {
      // We already took this link in this wave.
      return true;
    }
  } else {
    wave = [id];
  }
  return false;
}


function filterFailed(value, src, dst) {
  if( typeof dst.filter === 'function' ) {
    try {
      if( !dst.filter( value ) ) return true;
    }
    catch( ex ) {
      console.error( ex );
      fail(
        "Error in filter of link "
          + PropertyManager(src.obj) + "." + src.name
          + " -> "
          + PropertyManager(dst.obj) + "." + dst.name + "!"
      );
    }
  }
  return false;
}


function processSwitch( value, dst, pmSrc ) {
  if( typeof dst.switch === 'string' ) {
    return pmSrc.get( dst.switch );
  }
  else if( Array.isArray( dst.switch ) ) {
    return dst.switch.map(function(name) {
      return pmSrc.get( name );
    });
  }
  return value;
}


function processConverter( value, src, dst ) {
  if( typeof dst.converter === 'function' ) {
    try {
      return dst.converter( value );
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
  return value;
}


function processValue( value, src, dst ) {
  if( typeof dst.value === 'undefined' ) return value;
  if( typeof dst.value === 'function' ) {
    try {
      return dst.value( src.name );
    }
    catch( ex ) {
      console.error( ex );
      fail(
        "Error in value(" + src.name + ") of link "
          + PropertyManager(src.obj) + "." + src.name
          + " -> "
          + PropertyManager(dst.obj) + "." + dst.name + "!"
      );
    }
  }
  return dst.value;
}
