"use strict";

/**
 * @param {dom} element
 * @param {function} events - Shortcut for `{ tap: ... }`.
 * @param {function} events.tap { x, y }
 * @param {function} events.doubletap { x, y }
 * @param {function} events.drag { x, y, x0, y0, vx, vy }
 * @param {function} events.dragstart { x, y }
 * @param {function} events.dragend { x, y, x0, y0 }
 * @param {function} events.drag { x, y, x0, y0, vx, vy }
 * @param {function} events.wheel { x, y, delta }
 */
module.exports = getGesture;

//============================================================

var HANDLERS = {
  tap: onTap,
  doubletap: onDoubletap,
  drag: onDrag,
  dragstart: onDragStart,
  dragend: onDragEnd,
  move: onMove,
  down: onDown,
  up: onUp,
  wheel: onWheel
};

var SYMBOL = '__tfw.gestures__';
// Webkit and Opera still use 'mousewheel' event type.
var WHEEL_EVENT = "onwheel" in document.createElement("div") ? "wheel" :
      // Modern browsers support "wheel"
      document.onmousewheel !== undefined ? "mousewheel" :
      // Webkit and IE support at least "mousewheel"
      "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox


var Hammer = require("external.hammer");


var SUPPORTED_EVENTS = Object.keys( HANDLERS );


function getGesture( element ) {
  element = ensureDom( element );
  if( !element[SYMBOL] ) element[SYMBOL] = new Gesture( element );
  return element[SYMBOL];
}


var Gesture = function( element ) {
  Object.defineProperty( this, '$', { writable: false, value: element, configurable: false } );
  this._events = {};
  // Last time  a touch  start occurs.  This  is used to  prevent onmousedown  to be triggered  if a
  // touchstart has been processed.
  this._touchstart = 0;
}

/**
 * @member Gesture.on
 * @param
 */
Gesture.prototype.on = function( name, slot, args ) {
  try {
    if( typeof name === 'function' ) {
      slot = name;
      name = 'tap';
    }
    else {
      ensureValidGestureNameAndSlot( name, slot );
    }

    return HANDLERS[name].call( this, register.bind( this ), slot, args );
  }
  catch( ex ) {
    console.error("[Gesture.on( name, slot, args )]");
    console.error("   name", name);
    console.error("   slot", slot);
    console.error("   args", args);
    console.error("   ERROR", ex);
    throw(Error(ex));
  }
};

/**
 * We map a chain of responsability to each hammer event we need to deal with.
 * When an item  of that chain returns `true` that  means it will take the responsability  and we do
 * not ask the others.
 */
function handlerWithChainOfResponsability( eventName, evt ) {
  var chain = this._events[eventName].chain;
  for( var i = 0 ; i < chain.length ; i++ ) {
    var responsible = chain[i];
    if( responsible( evt ) === true ) return;
  }
}

/**
 * Add a responsability item in the chain of a hammer event.
 */
function register( event, responsible ) {
  var hammerEvent = getEventNameForPrefix( event, "hammer." );
  if( hammerEvent && !this._hammer ) {
    this._hammer = new Hammer( this.$ );
  }

  var eventDef = this._events[event];
  if( !eventDef ) {
    var handler = handlerWithChainOfResponsability.bind( this, event );
    eventDef = { chain: [], handler: handler };
    if( hammerEvent ) this._hammer.on( hammerEvent, handler );
    else this.$.addEventListener( event, handler );
    this._events[event] = eventDef;
  }
  eventDef.chain.push( responsible );
}


function ensureValidGestureNameAndSlot( name, slot ) {
  if( typeof name !== 'string' ) {
    throw Error("[Gestures.on] `name` must be a string: " + JSON(name) + "!");
  }
  if( SUPPORTED_EVENTS.indexOf( name ) === -1 ) {
    throw Error("Unknown gesture's name `" + name + "`!\n"
                + "Available names are: " + SUPPORTED_EVENTS.join(", ") + ".");
  }
  if( typeof slot !== 'function' ) {
    throw Error("Gesture `" + name + "` must have a function as slot!");
  }
}


function ensureDom( dom ) {
  if( dom instanceof Node ) return dom;
  if ( dom === undefined || dom === null ) {
    throw Error("Not a valid DOM element!", dom);
  }
  if( dom.$ instanceof Node ) return dom.$;
  if( dom.element instanceof Node ) return dom.element;
  if (typeof dom === 'string') {
    var elem = document.getElementById( dom );
    if (!elem) {
      console.error( "There is no DOM element with this ID: `" + dom + "`" );
    }
    return elem;
  }
  if (typeof dom.element === 'function') return dom.element();
  return dom;
};


function setHammerXY( elem, evt ) {
  var x, y;
  // Hammer's attributes.
  x = evt.center.x;
  y = evt.center.y;
  var rect = elem.getBoundingClientRect();
  evt.x = x - rect.left;
  evt.y = y - rect.top;
}

function setXY( elem, evt ) {
  var x, y;
  // Browser's attributes.
  x = evt.clientX;
  y = evt.clientY;
  var rect = elem.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top
  };
}

function setHammerVxVy( elem, evt ) {
  evt.vx = evt.x - this._dragX;
  evt.vy = evt.y - this._dragY;
  evt.x0 = evt.x - evt.deltaX;
  evt.y0 = evt.y - evt.deltaY;
  this._dragX = evt.x;
  this._dragY = evt.y;
}


function onTap( register, slot, args ) {
  var that = this;

  register( 'hammer.tap', function( evt ) {
    if( evt.tapCount !== 1 ) return false;
    setHammerXY( that.$, evt );
    slot({
      x: evt.x,
      y: evt.y,
      preventDefault: evt.preventDefault.bind( evt )
    });
    return true;
  });
}

function onDoubletap( register, slot, args ) {
  var that = this;

  register( 'hammer.tap', function( evt ) {
    if( evt.tapCount !== 2 ) return false;
    setHammerXY( that.$, evt );
    slot({
      x: evt.x,
      y: evt.y,
      preventDefault: evt.preventDefault.bind( evt )
    });
    return true;
  });
}

function onWheel( register, slot, args ) {
  var that = this;
  register( WHEEL_EVENT, function( evt ) {
    var newEvt = setXY( that.$, evt );
    newEvt.delta = evt.deltaY;
    newEvt.preventDefault = evt.preventDefault.bind( evt );
    newEvt.stopPropagation = evt.stopPropagation.bind( evt );    
    slot( newEvt );
  });
}

function onMove( register, slot ) {
  var that = this;
  register( 'mousemove', function( evt ) {
    var newEvt = setXY( that.$, evt );
    newEvt.preventDefault = evt.preventDefault.bind( evt );
    newEvt.stopPropagation = evt.stopPropagation.bind( evt );    
    slot( newEvt );
  });
}

function onDrag( register, slot, args ) {
  var that = this;

  register( 'hammer.pan', function( evt ) {
    setHammerXY( that.$, evt );
    if( typeof that._dragX === 'undefined' ) {
      that._dragX = evt.x;
      that._dragY = evt.y;
      that._dragStart = true;
    }
    setHammerVxVy.call( that, that.$, evt );
    slot({
      x: evt.x,
      y: evt.y,
      x0: evt.x0,
      y0: evt.y0,
      vx: evt.vx,
      vy: evt.vy,
      preventDefault: evt.preventDefault.bind( evt )
    });
    return true;
  });
}


function onDragEnd( register, slot, args ) {
  var that = this;

  register( 'hammer.pan', function( evt ) {
    if( !evt.isFinal ) return false;
    setHammerXY( that.$, evt );
    setHammerVxVy.call( that, that.$, evt );
    slot({
      x: evt.x,
      y: evt.y,
      x0: evt.x0,
      y0: evt.y0,
      preventDefault: evt.preventDefault.bind( evt )
    });
    delete that._dragX;
    delete that._dragY;
    return true;
  });
}


function onDragStart( register, slot, args ) {
  var that = this;

  register( 'hammer.pan', function( evt ) {
    if( !that._dragStart && typeof that._dragX !== 'undefined' ) return false;
    setHammerXY.call( that, that.$, evt );
    slot({
      x: evt.x,
      y: evt.y,
      preventDefault: evt.preventDefault.bind( evt )
    });
    return true;
  });
}


function onDown( register, slot, args ) {
  var that = this;
  register( "touchstart", function( evt ) {
    if( !evt.changedTouches || evt.changedTouches.length < 1 ) return false;
    var touch = evt.changedTouches[0];
    var rect = that.$.getBoundingClientRect();
    try {
      slot({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        preventDefault: evt.preventDefault.bind( evt ),
        stopPropagation: evt.stopPropagation.bind( evt )
      });
    }
    catch( ex ) {
      console.error( ex );
    }
    return true;
  });
  register( "mousedown", function( evt ) {
    var now = Date.now();
    if( now - that._touchstart < 350 ) {
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    }
    var rect = that.$.getBoundingClientRect();
    try {
      slot({
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
        preventDefault: evt.preventDefault.bind( evt ),
        stopPropagation: evt.stopPropagation.bind( evt )
      });
    }
    catch( ex ) {
      console.error( ex );
    }
    that._touchstart = 0;
    return true;
  });
}


function onUp( register, slot, args ) {
  var that = this;
  register( "touchend", function( evt ) {
    if( !evt.changedTouches || evt.changedTouches.length < 1 ) return false;
    var touch = evt.changedTouches[0];
    var rect = that.$.getBoundingClientRect();
    try {
      slot({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        preventDefault: evt.preventDefault.bind( evt ),
        stopPropagation: evt.stopPropagation.bind( evt )
      });
    }
    catch( ex ) {
      console.error( ex );
    }
    that._touchstart = Date.now();
    return true;
  });
  register( "mouseup", function( evt ) {
    if( that._touchstart > 0 ) {
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    }
    var rect = that.$.getBoundingClientRect();
    try {
      slot({
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
        preventDefault: evt.preventDefault.bind( evt ),
        stopPropagation: evt.stopPropagation.bind( evt )
      });
    }
    catch( ex ) {
      console.error( ex );
    }
    that._touchstart = 0;
    return true;
  });
}


function getEventNameForPrefix( text, prefix ) {
  if( text.substr( 0, prefix.length ) == prefix ) {
    return text.substr( prefix.length );
  }
  return null;
}
