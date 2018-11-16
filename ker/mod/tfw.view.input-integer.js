"use strict";

/* exported CODE_BEHIND */
const CODE_BEHIND = { onValueChanged };

/**
 * @this ViewXJS
 * @param {any} v - Value that is only valid if numeric and in the range [min, max].
 * @return {undefined}
 */
function onValueChanged( v ) {
    const num = parseInt( v, 10 );
    if ( isNaN( num ) ) this.valid = false;
    else if ( num < this.min ) this.valid = false;
    else if ( num > this.max ) this.valid = false;
    else this.valid = true;
}