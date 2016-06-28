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
    // Coords of _down_ on target.
    targetX: 0, targetY: 0,
    // Coords of _down_ on body.
    downX: 0, downY: 0,
    // Current mouse position on body.
    x: -1, y: -1,
    // Last mouse position on body.
    lastX: -1, lastY: -1,
    // drag event.
    onDrag: null,
    // Last time tap for double tap detection.
    lastTapTime: 0
};

document.body.addEventListener( 'mousedown', function(evt) {
    if (G.touchDevice) return;
    G.downX = evt.clientX;
    G.downY = evt.clientY;
    G.x = evt.clientX;
    G.y = evt.clientY;
    G.lastX = evt.clientX;
    G.lastY = evt.clientY;
}, true );

document.body.addEventListener( 'mousemove', function(evt) {
    if (G.touchDevice) return;
    G.lastX = G.x;
    G.lastY = G.y;
    G.x = evt.offsetX;
    G.y = evt.offsetY;
    if (G.onDrag) {
        G.onDrag();
    }
}, true );



function PointerEvents( element ) {
    var that = this;

    this._slots = {};

    Object.defineProperty( PointerEvents.prototype, 'element', {
        value: element, writable: false, configurable: true, enumerable: true
    });

    //===============
    // Toush events.
    element.addEventListener( 'touchstart', function(evt) {
        G.touchDevice = true;
        var slots = that._slots;
        if (evt.touches.length == 1) {
            G.rect = element.getBoundingClientRect();
            G.x = evt.touches[0].clientX;
            G.y = evt.touches[0].clientY;
            G.downX = evt.touches[0].clientX;
            G.downY = evt.touches[0].clientY;
            G.targetX = evt.touches[0].clientX - G.rect.left;
            G.targetY = evt.touches[0].clientY - G.rect.top;
            G.time = Date.now();
            if (slots.down) {
                slots.down({
                    action: 'down',
                    target: element,
                    x: G.targetX,
                    y: G.targetY
                });
            }
        }
    });
    element.addEventListener( 'touchmove', function(evt) {
        var lastX = G.x;
        var lastY = G.y;
        G.x = evt.touches[0].clientX;
        G.y = evt.touches[0].clientY;
        var slots = that._slots;
        if (slots.drag) {
            slots.drag({
                action: 'drag',
                target: element,
                x0: G.targetX,
                y0: G.targetY,
                x: G.x - G.rect.left,
                y: G.y - G.rect.top,
                dx: G.x - G.downX,
                dy: G.y - G.downY,
                vx: G.x - lastX,
                vy: G.y - lastY
            });
        }
    });
    element.addEventListener( 'touchend', function(evt) {
        var slots = that._slots;
        var dx = G.x - G.downX;
        var dy = G.y - G.downY;
        if (slots.up) {
            slots.up({
                action: 'up',
                target: that.element,
                x: G.x - G.rect.left,
                y: G.y - G.rect.top,
                dx: dx,
                dy: dy
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
                        x: G.x - G.rect.left,
                        y: G.y - G.rect.top
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
                    x: G.x - G.rect.left,
                    y: G.y - G.rect.top
                });
            }
            G.lastTapTime = time;
        }
    });

    //===============
    // Mouse events.
    element.addEventListener( 'mousedown', function(evt) {
        if (G.touchDevice) return;
        console.log("MOUSE DOWN");
        evt.stopPropagation();
        evt.preventDefault();
        var slots = that._slots;
        var rect = element.getBoundingClientRect();
        G.targetX = evt.clientX - rect.left;
        G.targetY = evt.clientY - rect.top;
        if (slots.drag) {
            G.onDrag = function() {
                slots.drag({
                    action: 'drag',
                    target: element,
                    x0: G.targetX,
                    y0: G.targetY,
                    x: G.targetX + G.x - G.downX,
                    y: G.targetY + G.y - G.downY,
                    dx: G.x - G.downX,
                    dy: G.y - G.downY,
                    vx: G.x - G.lastX,
                    vy: G.y - G.lastY
                });
            };
        }
        if (slots.down) {
            slots.down({
                action: 'down',
                target: element,
                x: G.targetX,
                y: G.targetY
            });
        }

        var screen = document.createElement( 'div' );
        if (slots.drag) {
            // If the slot `drag` has been defined, we change the cursor.
            screen.style.cursor = element.style.cursor || 'move';
        }
        screen.className = "tfw-pointer-events";
        document.body.appendChild( screen );

        screen.addEventListener( 'mouseup', function(evt) {
            var time = Date.now();
            G.onDrag = null;
            document.body.removeChild( screen );
            var slots = that._slots;
            var dx = G.x - G.downX;
            var dy = G.y - G.downY;
            if (slots.up) {
                slots.up({
                    action: 'up',
                    target: that.element,
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
                            target: that.element,
                            x: G.targetX + dx,
                            y: G.targetY + dy
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
                        x: G.targetX + dx,
                        y: G.targetY + dy
                    });
                }
                G.lastTapTime = time;
            }
        }, false);
    });
    element.addEventListener( 'mousemove', function(evt) {
        var slots = that._slots;
        if (slots.move) {
            slots.move({
                target: element,
                action: 'move',
                x: evt.offsetX,
                y: evt.offsetY
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
        this.element.addEventListener(WHEEL_EVENT, function(evt) {
            console.info("[tfw.pointer-events] evt=...", evt);
            var rect = that.element.getBoundingClientRect();
            slots.wheel({
                target: that.element,
                action: 'wheel',
                delta: evt.deltaY,
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            });
        });
    }
    return this;
};


module.exports = PointerEvents;
