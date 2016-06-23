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
 * * __elem__: target DOM element.
 *
 * @return {object}
 * * __value__    {boolean}:    If    `true`    the    element    goes
     fullscreen. Otherwise, it returns to its initial position.
 */
exports.fullscreen = function( opts ) {
    if( typeof opts === 'undefined' ) {
        throw Error("[dom.fx:fullscreen] Missing argument!");
    }
    if( typeof opts.elem === 'undefined' ) {
        throw Error("[dom.fx:fullscreen] Missing `opts.elem`!");
    }
    if (typeof opts.elem.element === 'function') opts.elem = opts.elem.element();
    if( typeof opts.elem.element !== 'undefined' ) opts.elem = opts.elem.element;

    
    var isFullscreen = false;

    Object.defineProperty( opts, 'value', {
        get: function() { return this._value; },
        set: function(v) { this._value = v; },
        configurable: true,
        enumerable: true
    });
};
