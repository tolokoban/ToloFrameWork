"use strict";

require("polyfill.promise");
var $ = require("dom");
var DB = require("tfw.data-binding");

var delay = window.setTimeout;

var EMPTY_FUNC = function() {};
var ID = 1;

var Fx = function( name ) {
  // Because it is  possible to call `end()` before  the sequence is
  // over, we need  to know in what  session we are. This  way, if a
  // callback is called after the end,  it can know that it must not
  // execute the next task.
  this._session = {};
  // A name can be defined for debug purpose, but it is not used right now.
  Object.defineProperty( Fx.prototype, 'name', {
    value: name,
    writable: false,
    configurable: true,
    enumerable: true
  });
  this._name = name;
  // Sequence of  tasks. A task  is a function with  two parameters:
  // the `next()` function and a  boolean `async` which tells you if
  // your are allowed to call async functions.
  // When  a task  is  called in  the `end()`  function,  it is  not
  // allowed to call async functions.
  this._tasks = [];
  // Index of the current task.
  this._index = 0;
  this._started = false;
  this._startTime = 0;
  this._onEnd = EMPTY_FUNC;
};

/**
 * @member Fx.go
 * @param
 */
Fx.prototype.start = function(onEnd) {
  if( this._started ) this.end();
  if (typeof onEnd !== 'function' ) onEnd = EMPTY_FUNC;
  this._onEnd = onEnd;
  this._started = true;
  this._index = 0;
  this._session = { $id: ID++ };
  this._startTime = Date.now();
  next.call( this, this._session );
};

function next( session ) {
  if( session != this._session ) return;
  if( this._index >= this._tasks.length ) {
    this._index = 0;
    this._started = false;
    delete this._session;
    this._onEnd( this );
    return;
  }

  var that = this;
  var tsk = this._tasks[this._index++];
  if( this._debug ) {
    console.info( "[dom.fx] tsk[" + (this._index - 1) + "]: ", tsk.label,
                  "(" + (Date.now() - this._startTime) + " ms)", tsk.args, session );
  }
  tsk(function(){
    delay( next.bind( that, session ) );
  }, true);
};

Fx.prototype.end = function() {
  if( !this._started ) return this;
  var that = this;
  this._started = false;
  delete this._session;
  while( this._index < this._tasks.length ) {
    var tsk = this._tasks[this._index++];
    if( that._debug ) {
      console.info( "[dom.fx.end] tsk[" + (this._index - 1) + "]: ", tsk.label, tsk.args );
    }
    tsk( EMPTY_FUNC, false );
  }
  this._onEnd( this );
  return this;
};

/**
 * @member Fx.debug
 * @param value
 */
Fx.prototype.debug = function(value) {
  this.addTask( function( next ) {
    this._debug = value ? true : false;
    next();
  });
  return this;
};

/**
 * @return void
 */
Fx.prototype.addTask = function( task, label, args ) {
  task.label = label;
  task.args = args;
  this._tasks.push( task );
  return this;
};

/**
 * @return void
 */
Fx.prototype.log = function(msg) {
  this.addTask(function(next) {
    console.log( "[dom.fx]", msg );
    next();
  }, 'log');
  return this;
};

/**
 * Stop execution of the animation until end() has been called.
 */
Fx.prototype.pause = function() {
  this.addTask( EMPTY_FUNC, 'pause' );
  return this;
};

Fx.prototype.exec = function() {
  var args = Array.prototype.slice.call( arguments );
  this.addTask(function(next, session) {
    args.forEach(function (arg) {
      try {
        if( typeof arg === 'function' ) arg( session );
        else console.log( '[dom.fx]', arg );
      }
      catch( ex ) {
        console.error( ex );
      }
    });
    next();
  }, 'exec', args );
  return this;
};

[
  'css', 'addClass', 'removeClass', 'toggleClass', 'detach',
  'saveStyle', 'restoreStyle', 'add', 'removeAtt', 'replace'
].forEach(function (methodname) {
  var slot = $[methodname];
  Fx.prototype[methodname] = function() {
    var args = Array.prototype.slice.call(arguments);
    this.addTask(function(next) {
      slot.apply( $, args );
      next();
    }, methodname, args );
    return this;
  };
});


/**
 * @member Fx.vanish
 * @param elem, ms
 */
Fx.prototype.vanish = function(elem, ms) {
  ms = parseInt( ms );
  if( isNaN( ms ) ) ms = 300;
  return this.css( elem, { transition: "none" } )
    .css(elem, { transition: "opacity " + ms + "ms", opacity: 0 } )
    .wait( ms );
};

Fx.prototype.vanishAndDetach = function(elem, ms) {
  ms = parseInt( ms );
  if( isNaN( ms ) ) ms = 300;
  return this.vanish(elem, ms).detach(elem);
};

/**
 * @member Fx.wait
 * @param ms
 */
Fx.prototype.wait = function(msOrElem) {
  var that = this;
  var args = Array.prototype.slice.call( arguments );

  if( typeof msOrElem === 'undefined' ) msOrElem = 0;
  if( typeof msOrElem === 'number' ) {
    this.addTask(function(next, async) {
      if( async ) {
        delay(next, msOrElem);
      }
    }, 'wait', args );
  } else {
    this.addTask(function(next, async) {
      if( async ) {
        var e = $(msOrElem);
        var slot = function(evt) {
          ['transitionend', 'oTransitionEnd', 'webkitTransitionEnd'].forEach(function (itm) {
            e.removeEventListener( itm, slot );
          });
          next();
        };
        ['transitionend', 'oTransitionEnd', 'webkitTransitionEnd'].forEach(function (itm) {
          e.addEventListener( itm, slot );
        });
      }
    }, 'wait', args );
  }
  return this;
};


module.exports = function( name ) {
  return new Fx( name );
};


/**
 * @module dom.fx
 *
 * @description
 * All the animation effects you can do on DOM elements.
 *
 * @example
 * var mod = require('dom.fx');
 */


/**
 * @export {function} fullscreen
 * @param opts
 * * __target__: target DOM element.
 *
 * @return {object}
 * * __value__    {boolean}:    If    `true`    the    element    goes
 fullscreen. Otherwise, it returns to its initial position.
 */
module.exports.Fullscreen = function( opts ) {
  if( typeof opts === 'undefined' ) {
    throw Error("[dom.fx:fullscreen] Missing argument!");
  }
  if( typeof opts.target === 'undefined' ) {
    throw Error("[dom.fx:fullscreen] Missing `opts.target`!");
  }
  if (typeof opts.target.element === 'function') opts.target = opts.target.element();
  if( typeof opts.target.element !== 'undefined' ) opts.target = opts.target.element;

  var voidFunc = function() {};
  var tools = {
    onBeforeReplace: typeof opts.onBeforeReplace === 'function' ? opts.onBeforeReplace : voidFunc,
    onAfterReplace: typeof opts.onAfterReplace === 'function' ? opts.onAfterReplace : voidFunc
  };
  DB.propBoolean(this, 'value')(function(isFullScreen) {
    if (isFullScreen) {
      fullscreenOn( opts.target, tools );
    } else {
      fullscreenOff( opts.target, tools );
    }
  });
};

function fullscreenOn( target, tools ) {
  if (tools.terminate) tools.terminate();

  var rect = target.getBoundingClientRect();
  console.info("[dom.fx] rect=...", rect);
  var substitute = $.div();
  $.css(substitute, {
    display: 'inline-block',
    width: rect.width + "px",
    height: rect.height + "px"
  });

  tools.onBeforeReplace( target );
  $.replace( substitute, target );
  tools.onAfterReplace( target );

  tools.substitute = substitute;
  tools.styles = saveStyles( target );
  tools.overlay = $.div('dom-fx-fullscreen');
  document.body.appendChild( tools.overlay );
  tools.overlay.appendChild( target );
  $.css(target, {
    left: rect.left + 'px',
    top: rect.top + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  });
  $.addClass(target, 'dom-fx-fullscreen-target');

  delay(function() {
    var r2 = tools.overlay.getBoundingClientRect();
    $.css(target, {
      left: '20px',
      top: '20px',
      width: (r2.width - 40) + 'px',
      height: (r2.height - 40) + 'px'
    });
  });
}

function fullscreenOff( target, tools ) {
  var rect = tools.substitute.getBoundingClientRect();
  $.css(target, {
    left: rect.left + 'px',
    top: rect.top + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  });
  tools.terminate = function() {
    $.detach( tools.overlay );

    tools.onBeforeReplace( target );
    $.replace( target, tools.substitute );
    tools.onAfterReplace( target );

    loadStyles( target, tools.styles );
    delete tools.terminate;
  };

  delay(tools.terminate, 200);
}

function saveStyles( element ) {
  var styles = {};
  var key, val;
  for( key in element.style ) {
    val = element.style[key];
    styles[key] = val;
  }
  console.info("[dom.fx] styles=...", styles);
  return styles;
}

function loadStyles( element, styles ) {
  for( var key in styles ) {
    element.style[key] = styles[key];
  }
}
