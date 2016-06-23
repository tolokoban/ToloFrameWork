/**
 * @module tfw.pointer-events
 *
 * @description
 *
 *
 * @example
 * var mod = require('tfw.pointer-events');
 */


var G = {
    // As soon as a touch occurs, no more mouse events can be handled.
    touchDevice: false,
    // Coords of _down_ on target.
    targetX: 0, targetY: 0,
    // Coords of _down_ on body.
    downX: 0, downY: 0,
    // Current mouse position on body.
    x: 0, y: 0,
    // drag event.
    onDrag: null,
    // Last time tap for double tap detection.
    lastTapTime: 0
};

document.body.addEventListener( 'mousedown', function(evt) {
    if (G.touchDevice) return;
    G.downX = evt.clientX;
    G.downY = evt.clientY;
}, true );

document.body.addEventListener( 'mousemove', function(evt) {
    if (G.touchDevice) return;
    G.x = evt.clientX;
    G.y = evt.clientY;
    if (G.onDrag) G.onDrag();
}, true );



function PointerEvents( element ) {
    var that = this;

    this._slots = {};

    Object.defineProperty( PointerEvents.prototype, 'element', {
        value: element, writable: false, configurable: true, enumerable: true
    });
    element.addEventListener( 'touchstart', function(evt) {
        G.touchDevice = true;
        console.log('TOUCH START');
    });
    element.addEventListener( 'touchend', function(evt) {
        console.log('TOUCH END');
    });

    element.addEventListener( 'mousedown', function(evt) {
        if (G.touchDevice) return;
        evt.stopPropagation();
        evt.preventDefault();
        var slots = that._slots;
        G.targetX = evt.clientX;
        G.targetY = evt.clientY;
        if (slots.drag) {
            G.onDrag = function() {
                slots.drag({
                    action: 'drag',
                    target: element,
                    dx: G.x - G.downX,
                    dy: G.y - G.downY
                });
            };
        }
        if (slots.down) {
            slots.down({
                action: 'down',
                target: element,
                x: evt.clientX,
                y: evt.clientY
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
                    x: evt.clientX,
                    y: evt.clientY,
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
                            x: evt.clientX,
                            y: evt.clientY
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
                        x: evt.clientX,
                        y: evt.clientY
                    });
                }
                G.lastTapTime = time;
            }
        }, false);

    });
}


/**
 * @return void
 */
PointerEvents.prototype.on = function(action, event) {
    if (typeof event === 'function') {
        this._slots[action] = event;
    }
    return this;
};


module.exports = PointerEvents;
