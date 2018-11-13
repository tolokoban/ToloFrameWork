"use strict";


/* exported CODE_BEHIND */
const CODE_BEHIND = { onValueChanged, onTapBack, onDragStart, onDrag, onDragEnd };

const Dom = require( "dom" );


/**
 * @this viewXJS
 * @param {integer} v - New value.
 * @returns {undefined}
 */
function onValueChanged( v ) {
    if ( v < this.min ) {
        this.value = this.min;
        return;
    }
    if ( v > this.max ) {
        this.value = this.max;
        return;
    }
    this.displayedValue = valueToDisplayedValue.call( this, v );
    moveToValue.call( this, v );
}

/**
 * @this ViewXJS
 * @param {object} evt - {}
 * @returns {undefined}
 */
function onTapBack( evt ) {
    this.value = xToValue.call( this, evt.x );
}

/**
 * Convert a X position into the nearest value.
 *
 * @this ViewXJS
 * @param   {float} x - X position relative to the View.
 * @returns {integer} The nearest integer value.
 */
function xToValue( x ) {
    const
        rect = this.$.getBoundingClientRect(),
        percent = x / rect.width,
        range = this.max - this.min,
        value = Math.floor( percent * range + 0.5 );
    return this.min + this.step * Math.floor( value / this.step );
}

/**
 * Convert a value into X position relative to View.
 *
 * @this ViewXJS
 * @param   {integer} value - Current value.
 * @returns {float} X position.
 */
function valueToX( value ) {
    const
        rect = this.$.getBoundingClientRect(),
        percent = ( value - this.min ) / ( this.max - this.min );
    return rect.width * percent;
}

/**
 * We store the Bounding Client Rect to prevent from querying it at every next drag.
 *
 * @this ViewXJS
 * @returns {undefined}
 */
function onDragStart() {
    this._rect = this.$.getBoundingClientRect();
}

/**
 * Drag the button.
 *
 * @this ViewXJS
 * @param   {object} evt - `{ x, ... }`
 * @returns {undefined}
 */
function onDrag( evt ) {
    const
        rect = this._rect,
        x = valueToX.call( this, this.value ),
        min = -x,
        max = rect.width - x,
        tx = clamp( evt.x - evt.x0, min, max );
    Dom.css( this.$elements.button, { transform: `translateX(${tx}px)` } );
    this.displayedValue = valueToDisplayedValue.call( this, xToValue.call( this, x + tx ) );
}

/**
 * Enf of grag for the button. We can remove the temporaty translation.
 *
 * @this ViewXJS
 * @param   {object} evt - `{ x, ... }`
 * @returns {undefined}
 */
function onDragEnd( evt ) {
    const
        rect = this._rect,
        x = valueToX.call( this, this.value ),
        min = -x,
        max = rect.width - x,
        tx = clamp( evt.x - evt.x0, min, max );
    Dom.css( this.$elements.button, { transform: `translateX(0px)` } );
    this.value = xToValue.call( this, x + tx );
}

/**
 * Displayed value is a linear transformation of the real value.
 *
 * @this ViewXJS
 * @param   {integer} value [description]
 * @returns {float}       [description]
 */
function valueToDisplayedValue( value ) {
    return ( this.factor * value + this.shift ).toFixed( 0 );
}

/**
 * Move button to a position mapping the value.
 *
 * @this ViewXJS
 * @param   {integer} value - Value.
 * @returns {undefined}
 */
function moveToValue( value ) {
    const left = 100 * ( value - this.min ) / ( this.max - this.min );
    Dom.css( this.$elements.button, { left: `${left}%` } );
}

/**
 * Force a value to lay in a setAttributesAndRegisterElementsWithSpecialColors
 *
 * @param   {float} value - Value to clamp.
 * @param   {float} min   - Lower bound of the range.
 * @param   {float} max  - Upper bound of the range.
 * @returns {float} The clamped value.
 */
function clamp( value, min, max ) {
    if ( value < min ) return min;
    if ( value > max ) return max;
    return value;
}