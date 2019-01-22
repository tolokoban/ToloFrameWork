"use strict";

require( "polyfill.promise" );

/**
 * @param {function} action -  Action to call. Two consecutive actions cannot be  called if there is
 * less than `delay` ms between them.
 * @param {number} delay - Number of milliseconds.
 * @returns {function} The function to call as much as you want. It will perform the debouce for you.
 * Put in the same args as the `action` function.
 */
exports.debounce = debounce;

exports.later = later;
exports.laterPromise = laterPromise;
exports.laterAction = laterAction;
exports.longAction = longAction;


//############################################################


function later( delay ) {
    if ( typeof delay === 'undefined' ) delay = 1;
    return new Promise(
        function( resolve, reject ) {
            window.setTimeout( resolve, delay );
        }
    );
};


/**
 * @param action Promise to start after delay.
 * @param delay Milliseconds.
 */
var ActionPromise = function( action, delay ) {
    if ( typeof delay !== 'number' ) delay = 300;
    if ( delay < 0 ) delay = 0;
    var that = this;
    this.enabled = true;
    this.waiting = false;
    this.action = action;
    this.delay = delay;
    this.timer = 0;
};

/**
 * @return void
 */
ActionPromise.prototype.dbg = function( msg ) {
    console.log( ( this.enabled ? 'E' : 'e' ) + ( this.waiting ? 'W' : 'w' ) + ": " + msg );
};

/**
 * @return void
 */
ActionPromise.prototype.fire = function() {
    var that = this;
    if ( this.timer ) {
        window.clearTimeout( this.timer );
    }
    if ( this.enabled ) {
        this.waiting = false;
        var f = function() {
            that.enabled = true;
            if ( that.waiting ) {
                that.fire();
            }
        };
        this.timer = window.setTimeout(
            function() {
                that.timer = 0;
                that.enabled = false;
                that.action().then( f, f );
            },
            that.delay
        );
    } else {
        this.waiting = true;
    }
};


/**
 * @param action Function to start after delay.
 * @param delay Milliseconds.
 */
var Action = function( action, delay ) {
    if ( typeof delay !== 'number' ) delay = 300;
    if ( delay < 0 ) delay = 100;
    var that = this;
    this.action = action;
    this.delay = delay;
    this.timer = 0;
};

/**
 * @return void
 */
Action.prototype.fire = function() {
    var that = this;
    if ( this.timer ) {
        window.clearTimeout( this.timer );
    }
    this.timer = window.setTimeout(
        function() {
            that.timer = 0;
            that.enabled = false;
            that.action();
        },
        that.delay
    );
};

var LongAction = function() {
    this._timer = null;
    this._action = null;
};

/**
 * Fire an action. This action will be executed only if there is nothing else running.
 * @return void
 */
LongAction.prototype.fire = function( action, duration ) {
    var that = this;
    if ( !this._timer ) {
        action();
        this._timer = window.setTimeout(
            function() {
                that._timer = null;
            },
            duration
        );
    }
    return this;
};



/**
 * @param action A function returning a Promise.
 */
function laterPromise( action, delay ) {
    return new ActionPromise(
        function() {
            return new Promise( action );
        },
        delay
    );
};

/**
 * @param action A function to execute.
 */
function laterAction( action, delay ) {
    return new Action( action, delay );
};


function longAction() {
    return new LongAction();
}


/**
 * @param {function} action -  Action to call. Two consecutive actions cannot be  called if there is
 * less than `delay` ms between them.
 * @param {number} _delay - Number of milliseconds. Default is 300.
 * @returns {function} The function to call as much as you want. It will perform the debouce for you.
 * Put in the same args as the `action` function.
 */
function debounce( action, _delay ) {
    if ( typeof action !== 'function' ) {
        throw new Error( "[tfw.timer/debounce] First param must be a function!" );
    }
    const
        DEFAULT_DELAY = 300,
        delay = typeof _delay !== "undefined" ? _delay : DEFAULT_DELAY;

    let timer = 0;

    /**
     * @this action.this
     * @returns {[type]}        [description]
     */
    function debouncer( ...params ) {
        const that = this;
        if ( timer ) clearTimeout( timer );
        timer = setTimeout( function() {
            timer = 0;
            action.apply( that, params );
        }, delay );
    }

    return debouncer;
}


function throttling( action, delay ) {
    if ( typeof action !== 'function' ) throw "[tfw.timer/throttling] First param must be a function!";
    if ( typeof delay !== 'number' ) delay = 300;

    var params = null;
    var timer = 0;

    return function() {
        params = Array.prototype.slice.call( arguments );
        if ( timer ) return;
        timer = setTimeout( function() {
            timer = 0;
            action.apply( null, params );
        }, delay );
    };
}