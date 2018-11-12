"use strict";


/* exported CODE_BEHIND */
const CODE_BEHIND = { onValueChanged, onTapBack };

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
    const left = 100 * ( v - this.min ) / ( this.max - this.min );
    Dom.css( this.$elements.button, { left: `${left}%` } );
}

/**
 * @this ViewXJS
 * @param {object} evt - {}
 * @returns {undefined}
 */
function onTapBack( evt ) {
    const
        rect = evt.target.getBoundingClientRect(),
        percent = evt.x / rect.width,
        range = this.max - this.min,
        value = Math.floor( percent * range + 0.5 );
    this.value = this.min + this.step * Math.floor( value / this.step );
}