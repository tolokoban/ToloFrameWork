"use strict";

var PropertyManager = require("tfw.binding.property-manager");

var ID = 0;

/**
 * @export
 * @class Link
 * Bind A with B.
 * 
 * @param {object} args.A.obj - Source object holding properties.
 * @param {string} args.A.name - Name of the source's property.
 * @param  {number=0} args.A.delay  - Number  of milliseconds  to wait
 * before using the data sent by B. If a new value is sent by B before
 * the delay, the previous value is forgotten.
 * @param {function=null}  args.A.action - Function to  execute when A
 * received data from B.
 * @param {string=undefined} args.A.value -  If specified, it is the
 * value we use whatsover B sent.
 * @param  {function=undefined}  args.A.value  -  If  `value`  is  a
 * function, it will be called  with the propertyName as sole argument
 * and the return will be sent to dst.
 * @param  {function=undefined}  args.A.converter  -  Converter  for
 * values entering the source.
 * @param  {function=undefined} args.A.filter  -  Filter for  values
 * entering the source. If the filter returns `false` the value is not
 * set to the source.
 * @param   {string|array}  args.A.switch   -  Sometimes,   you  are
 * listening at  a property  A to  change, but  want to  propagate the
 * value  of  B. It  is  usefull  with  buttons which  provide  action
 * properties.
 * So this attribute  tells the link what property to  read instead of
 * the one  we are  listening on.  Moreover, if you  give an  array of
 * property names, the  value will be an array with  the values of all
 * asked properties.
 * @param {boolean=true}  args.A.open -  If false,  no data  will be
 * accepted by `A`.
 */
var Link = function( args ) {
  checkArgs( args );

  var id = ID++;
  var onChangedA = link( args, id, "A", "B" );
  var onChangedB = link( args, id, "B", "A" );
  addDestroyFunction.call( this, onChangedA, onChangedB );
};


module.exports = Link;


function link( args, id, emitterKey, receiverKey ) {
  var onChanged = [];
  args[receiverKey].forEach(function (receiver, receiverIndex) {
    if( !receiver.open ) return;
    var pmReceiver = PropertyManager( receiver.obj );
    args[emitterKey].forEach(function (emitter, emitterIndex) {
      if( typeof emitter.name === 'string'
          && typeof receiver.name === 'string'
          && emitter.obj === receiver.obj 
          && emitter.name === receiver.name ) 
      {
        console.error(
          "It is forbidden to bind a property on itself! (" 
            + emitterIndex + " -> " + receiverIndex + ")"
        );
        console.info("[tfw.binding.link] args=", args);
        return;
      }
      var pmEmitter = PropertyManager( emitter.obj );
      var slot = actionChanged.bind( this, emitter, receiver, id );
      pmEmitter.on( emitter.name, slot );
      onChanged.push({ pm: pmEmitter, name: emitter.name, slot: slot });
    });
  });
  return onChanged;
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
  if( typeof args.A === 'undefined' ) fail("Missing `args.A`!");
  if( !Array.isArray( args.A ) ) args.A = [args.A];
  if( typeof args.B === 'undefined' ) fail("Missing `args.B`!");
  if( !Array.isArray( args.B ) ) args.B = [args.B];

  var k;
  for( k = 0 ; k < args.A.length ; k++ ) {
    checkPod( args.A[k], k );
  }
  for( k = 0 ; k < args.B.length ; k++ ) {
    checkPod( args.B[k], k );
  }
}

function checkPod( pod, index ) {
  if( !pod.action ) {
    if( typeof pod.obj === 'undefined' ) fail("Missing `[" + index + "].obj`!");
    if( typeof pod.name === 'undefined' ) fail("Missing `[" + index + "].name`!");
  }
  else if ( typeof pod.action !== 'function' ) {
    fail("Attribute `[" + index + "].action` must be a function!");
  }
  else {
    if( typeof pod.obj !== 'undefined' )
      throw "[" + index + "].action cannot be defined in the same time of ["
      + index + "].obj! They are exclusive attributes.";
    if( typeof pod.name !== 'undefined' )
      throw "[" + index + "].action cannot be defined in the same time of ["
      + index + "].name! They are exclusive attributes.";

    // An action is emulated by a hollow object.
    var hollowObject = {};
    PropertyManager( hollowObject ).create("x", {
      set: pod.action
    });
    pod.obj = hollowObject;
    pod.name = "x";
    delete pod.action;
  }
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