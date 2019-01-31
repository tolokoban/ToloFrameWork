"use strict";

/**
 * Create a readonly property for a gicen object.
 * @param {object} target - The object that will own the property.
 * @param  {object} properties  - Keys  are the  properties' names.  Values can  be contants  or
 * functions.
 * @return {object} target.
 */
module.exports = function(target, properties) {
    for( const propName of Object.keys( properties ) ) {
        const value = properties[propName];
        if( typeof value === 'function') {
            Object.defineProperty( target, propName, {
                get: value,
                enumerable: true,
                configurable: false
            });
        } else {
            Object.defineProperty( target, propName, {
                value,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
    }
    return target;
};
