/**
 * @module tfw.pointer-events
 *
 * @description
 *
 *
 * @example
 * var mod = require('tfw.pointer-events');
 */

// Webkit and Opera still use 'mousewheel' event type.
var WHEEL_EVENT = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
        document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
        "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox


var G = {
    // As soon as a touch occurs, no more mouse events can be handled.
    touchDevice: false,
    // When a DOM element is touched, `target` holds it.
    // Then we can track mouse events on __body__ using capture.
    target: null,
    // Coords of _down_ on target.
    targetX: 0, targetY: 0,
    // Coords of _down_ on body.
    bodyDownX: 0, bodyDownY: 0,
    // Current mouse position on body.
    bodyMoveX: -1, bodyMoveY: -1,
    // Last mouse position on body.
    bodyMoveLastX: -1, bodyMoveLastY: -1,
    // drag event.
    onDrag: null,
    // Last time tap for double tap detection.
    lastTapTime: 0
};

document.body.addEventListener( 'mousedown', function(evt) {
    if (G.touchDevice) return;
    G.bodyDownX = evt.clientX;
    G.bodyDownY = evt.clientY;
    G.bodyMoveX = evt.clientX;
    G.bodyMoveY = evt.clientY;
    G.bodyMoveLastX = evt.clientX;
    G.bodyMoveLastY = evt.clientY;
}, true );

document.body.addEventListener( 'mousemove', function(evt) {
    if (G.touchDevice) return;
    G.bodyMoveLastX = G.bodyMoveX;
    G.bodyMoveLastY = G.bodyMoveY;
    var rectB = evt.target.getBoundingClientRect();
    G.bodyMoveX = evt.offsetX + rectB.left;
    G.bodyMoveY = evt.offsetY + rectB.top;

    if (!G.target) return;

    var slots = G.target._slots;
    if (typeof slots.drag !== 'function') return;

    slots.drag({
        action: 'drag',
        target: G.target.element,
        x0: G.targetX,
        y0: G.targetY,
        x: G.targetX + G.bodyMoveX - G.bodyDownX,
        y: G.targetY + G.bodyMoveY - G.bodyDownY,
        dx: G.bodyMoveX - G.bodyDownX,
        dy: G.bodyMoveY - G.bodyDownY,
        vx: G.bodyMoveX - G.bodyMoveLastX,
        vy: G.bodyMoveY - G.bodyMoveLastY
    });
}, true );

document.body.addEventListener( 'mouseup', function(evt) {
    if (G.touchDevice) return;
    if (!G.target) return;
    evt.stopPropagation();
    evt.preventDefault();

    var time = Date.now();
    var slots = G.target._slots;
    var dx = G.bodyMoveX - G.bodyDownX;
    var dy = G.bodyMoveY - G.bodyDownY;
    if (slots.up) {
        slots.up({
            action: 'up',
            target: G.target.element,
            x: G.targetX + dx,
            y: G.targetY + dy,
            dx: dx,
            dy: dy
        });
    }
    // Tap or doubletap.
    if (dx * dx + dy * dy < 256) {
        if (G.lastTapTime > 0) {
            if (slots.doubletap && time - G.lastTapTime < 400) {
                slots.doubletap({
                    action: 'doubletap',
                    target: G.target.element,
                    x: G.targetX + dx,
                    y: G.targetY + dy
                });
            } else {
                G.lastTapTime = 0;
            }
        }
        if (slots.tap && G.lastTapTime == 0) {
            slots.tap({
                action: 'tap',
                target: G.target.element,
                x: G.targetX + dx,
                y: G.targetY + dy
            });
        }
        G.lastTapTime = time;
    }
    delete G.target;
}, true);


function PointerEvents( element ) {
    var that = this;

    this._slots = {};
    this._eventListeners = [];

    Object.defineProperty( PointerEvents.prototype, 'element', {
        value: element, writable: false, configurable: true, enumerable: true
    });

    //===============
    // Touch events.
    addEvent.call(that, element, 'touchstart', function(evt) {
        G.touchDevice = true;
        var slots = that._slots;
        if (evt.touches.length == 1) {
            G.rect = element.getBoundingClientRect();
            G.bodyMoveX = evt.touches[0].clientX;
            G.bodyMoveY = evt.touches[0].clientY;
            G.bodyDownX = evt.touches[0].clientX;
            G.bodyDownY = evt.touches[0].clientY;
            G.targetX = evt.touches[0].clientX - G.rect.left;
            G.targetY = evt.touches[0].clientY - G.rect.top;
            G.time = Date.now();
            if (slots.down) {
                slots.down({
                    action: 'down',
                    target: element,
                    x: G.targetX,
                    y: G.targetY,
                    stopPropagation: evt.stopPropagation.bind( evt ),
                    preventDefault: evt.preventDefault.bind( evt )
                });
            }
        }
    });
    addEvent.call(that, element, 'touchmove', function(evt) {
        var lastX = G.bodyMoveX;
        var lastY = G.bodyMoveY;
        G.bodyMoveX = evt.touches[0].clientX;
        G.bodyMoveY = evt.touches[0].clientY;
        var slots = that._slots;
        if (slots.drag) {
            slots.drag({
                action: 'drag',
                target: element,
                x0: G.targetX,
                y0: G.targetY,
                x: G.bodyMoveX - G.rect.left,
                y: G.bodyMoveY - G.rect.top,
                dx: G.bodyMoveX - G.bodyDownX,
                dy: G.bodyMoveY - G.bodyDownY,
                vx: G.bodyMoveX - lastX,
                vy: G.bodyMoveY - lastY,
                stopPropagation: evt.stopPropagation.bind( evt ),
                preventDefault: evt.preventDefault.bind( evt )
            });
        }
    });
    addEvent.call(that, element, 'touchend', function(evt) {
        var slots = that._slots;
        var dx = G.bodyMoveX - G.bodyDownX;
        var dy = G.bodyMoveY - G.bodyDownY;
        if (slots.up) {
            slots.up({
                action: 'up',
                target: that.element,
                x: G.bodyMoveX - G.rect.left,
                y: G.bodyMoveY - G.rect.top,
                dx: dx,
                dy: dy,
                stopPropagation: evt.stopPropagation.bind( evt ),
                preventDefault: evt.preventDefault.bind( evt )
            });
        }
        // Tap or doubletap.
        if (dx * dx + dy * dy < 256) {
            var time = Date.now();
            if (G.lastTapTime > 0) {
                if (slots.doubletap && time - G.lastTapTime < 400) {
                    slots.doubletap({
                        action: 'doubletap',
                        target: that.element,
                        x: G.bodyMoveX - G.rect.left,
                        y: G.bodyMoveY - G.rect.top,
                        stopPropagation: evt.stopPropagation.bind( evt ),
                        preventDefault: evt.preventDefault.bind( evt )
                    });
                } else {
                    G.lastTapTime = 0;
                }
            }
            if (slots.tap && G.lastTapTime == 0) {
                evt.stopPropagation();
                evt.preventDefault();
                slots.tap({
                    action: 'tap',
                    target: that.element,
                    x: G.bodyMoveX - G.rect.left,
                    y: G.bodyMoveY - G.rect.top,
                    stopPropagation: evt.stopPropagation.bind( evt ),
                    preventDefault: evt.preventDefault.bind( evt )
                });
            }
            G.lastTapTime = time;
        }
    });

    //===============
    // Mouse events.
    addEvent.call(that, element, 'mousedown', function(evt) {
        if (G.touchDevice) return;
        var slots = that._slots;
        var rect = element.getBoundingClientRect();
        G.target = that;
        G.targetX = evt.clientX - rect.left;
        G.targetY = evt.clientY - rect.top;
        if (slots.down) {
            slots.down({
                action: 'down',
                target: element,
                x: G.targetX,
                y: G.targetY,
                stopPropagation: evt.stopPropagation.bind( evt ),
                preventDefault: evt.preventDefault.bind( evt )
            });
        }
    });
    addEvent.call(that, element, 'mousemove', function(evt) {
        var slots = that._slots;
        if (slots.move) {            
            var rectA = element.getBoundingClientRect();
            var rectB = evt.target.getBoundingClientRect();
            slots.move({
                target: element,
                action: 'move',
                x: evt.offsetX + rectB.left - rectA.left,
                y: evt.offsetY + rectB.top - rectA.top
            });
        }
    });

    Object.defineProperty( this, 'element', {
        value: element, writable: true, configurable: true, enumerable: true
    });
}


/**
 * @return void
 */
PointerEvents.prototype.on = function(action, event) {
    var that = this;

    var slots = this._slots;
    if (typeof event === 'function') {
        slots[action] = event;
    }
    if (action == 'wheel') {
        addEvent.call(that, this.element, WHEEL_EVENT, function(evt) {
            var rect = that.element.getBoundingClientRect();
            slots.wheel({
                target: that.element,
                action: 'wheel',
                delta: evt.deltaY,
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top,
                stopPropagation: evt.stopPropagation.bind( evt ),
                preventDefault: evt.preventDefault.bind( evt )
            });
        });
    }
    return this;
};


/**
 * @return void
 */
PointerEvents.prototype.off = function() {
    this._eventListeners.forEach(function (itm) {
        var element = itm[0];
        var event = itm[1];
        var listener = itm[2];
        var capture = itm[3];
        element.removeEventListener( event, listener, capture );
    });
};


function addEvent(element, event, listener, capture) {
    element.addEventListener( event, listener, capture );
    this._eventListeners.push([element, event, listener, capture]);
}

module.exports = PointerEvents;
