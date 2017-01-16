"use strict";

require("polyfill.promise");
var $ = require("dom");
var DB = require("tfw.data-binding");

var delay = window.setTimeout;

var EMPTY_FUNC = function() {};

var Fx = function() {
    this._tasks = [];
    this._index = 0;
    this._flush = false;
    this._started = false;
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
    var that = this;
    this._flush = false;
    this._started = true;
    this._index = 0;
    next.call( this );
};

function next() {
    if( !this._started || this._flush ) return;
    if( this._index >= this._tasks.length ) {
        this._index = 0;
        this._started = false;
        console.log("[dom.fix] TERMINATED");
        this._onEnd( this );
        return;
    }

    var that = this;
    var tsk = this._tasks[this._index++];
    console.info("[dom.fx] tsk[" + (this._index - 1) + "]=...", tsk);
    tsk(function(){
        delay( next.bind( that ) );
    });
};

Fx.prototype.end = function() {
    if( !this._started ) return this;
    this._flush = true;
    while( this._index < this._tasks.length ) {
        var tsk = this._tasks[this._index++];
        tsk(EMPTY_FUNC);
    }
    this._onEnd( this );
    return this;
};

/**
 * @return void
 */
Fx.prototype.log = function(msg) {
    this._tasks.push(function(next) {
        console.log( "[dom.fx]", msg );
        next();
    });
    return this;
};

[
    'css', 'addClass', 'removeClass', 'toggleClass', 'detach',
    'popStyle', 'pushStyle'
].forEach(function (methodname) {
    var slot = $[methodname];
    Fx.prototype[methodname] = function() {
        var args = Array.prototype.slice.call(arguments);
        this._tasks.push(function(next) {
            slot.apply( $, args );
            next();
        });
        return this;
    };
});


/**
 * @member Fx.vanish
 * @param elem, ms
 */
Fx.prototype.vanish = function(elem, ms) {
    var that = this;

    if( typeof ms !== 'number' ) ms = 300;
    this._tasks.push(function(next) {
        $.css( elem, {
            transition: "opacity " + ms + "ms",
            opacity: 1
        });
        if( that._flush ) {
            $.css( elem, { opacity: 0 } );
            next();
        } else {
            this.wait(function() {
                $.css( elem, { opacity: 0 } );
                this.wait( next, ms );
            });
        }
    });
    return this;
};


/**
 * @member Fx.wait
 * @param ms
 */
Fx.prototype.wait = function(msOrElem) {
    var that = this;

    if( typeof msOrElem === 'undefined' ) msOrElem = 0;
    if( typeof msOrElem === 'number' ) {
        this._tasks.push(function(next) {
            if( that._flush) next();
            else {
                that._delaySlot = next;
                that._delayId = delay(next, msOrElem);
            }
        });
    } else {
        this._tasks.push(function(next) {
            if( !that._flush ) {
                var e = $(msOrElem);
                var slot = function(evt) {
                    console.info("[dom.fx] (transitionend) evt=...", evt);
                    ['transitionend', 'oTransitionEnd', 'webkitTransitionEnd'].forEach(function (itm) {
                        e.removeEventListener( itm, slot );
                    });
console.log("NEXT!!!!!");
                    next();
                };
                ['transitionend', 'oTransitionEnd', 'webkitTransitionEnd'].forEach(function (itm) {
                    e.addEventListener( itm, slot );
                });
            }
        });
    }
    return this;
};

/**
 *
 */
Object.defineProperty( module, 'exports', {
    get: function() { return new Fx(); },
    set: function() {}
});


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
exports.Fullscreen = function( opts ) {
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
