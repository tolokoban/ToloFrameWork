/**
 * @module tfw.data-binding
 *
 * @description
 * Provide all the functions needed for data-binding.
 *
 * @example
 * var mod = require('tfw.data-binding');
 */
require("polyfill.string");
var Listeners = require("tfw.listeners");


var ID = '_tfw.data-binding_';

var converters = {
    castBoolean: function(v) {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
            v = v.trim().toLowerCase();
            if (v == '1' || v == 'true' || v == 'yes') {
                return true;
            } else if (v == '0' || v == 'false' || v == 'no') {
                return false;
            }
        }
        if (typeof v === 'number') {
            return v ? true : false;
        }
        return null;
    },
    castColor: function(v) {
        return "" + v;
    },
    castEnum: function( enumeration ) {
        var lowerCaseEnum = enumeration.map(String.toLowerCase);
        return function(v) {
            if (typeof v === 'number') {
                return enumeration[Math.floor( v ) % enumeration.length];
            }
            if (typeof v !== 'string') return enumeration[0];
            var idx = lowerCaseEnum.indexOf( v.trim().toLowerCase() );
            if (idx < 0) idx = 0;
            return enumeration[idx];
        };
    },
    castInteger: function(v) {
        if (typeof v === 'number') {
            return Math.floor( v );
        }
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (typeof v === 'string') {
            return parseInt( v );
        }
        return Number.NaN;
    },
    castString: function(v) {
        if (typeof v === 'string') return v;
        return JSON.stringify( v );
    },
    castStringArray: function(v) {
        if (Array.isArray( v )) return v;
        if (typeof v === 'string') {
            return v.split( ',' ).map(String.trim);
        }
        return [JSON.stringify( v )];
    },
    castUnit: function(v) {
        return "" + v;
    },
    castValidator: function(v) {
        if (typeof v === 'function') return v;
        if (typeof v === 'boolean') return function() { return v; };
        if (typeof v === 'string' && v.trim().length != 0 ) {
            try {
                var rx = new RegExp( v );
                return rx.test.bind( rx );
            }
            // Ignore Regular Expression errors.
            catch (ex) {
                console.error("[castValidator] /" + v + "/ ", ex);
            }
        };
        return function() { return null; };
    }
};

function propCast( caster, obj, att, val, getter ) {
    if( typeof obj[ID] === 'undefined' ) obj[ID] = {};
    obj[ID][att] = {
        value: val,
        event: new Listeners()
    };
    var setter;
    if (typeof caster === 'function') {
        setter = function(v) {
            v = caster( v );
            if( obj[ID][att].value !== v ) {
                obj[ID][att].value = v;
                obj[ID][att].event.fire( v, obj, att );
            }
        };
    } else {
        setter = function(v) {
            if( obj[ID][att].value !== v ) {
                obj[ID][att].value = v;
                obj[ID][att].event.fire( v, obj, att );
            }
        };
    }
    if (typeof getter !== 'function') {
        // Default getter.
        getter = function() { return obj[ID][att].value; };
    }
    Object.defineProperty( obj, att, {
        get: getter,
        set: setter,
        configurable: false,
        enumerable: true
    });
    return exports.bind.bind(exports, obj, att);
};

exports.fire = function( obj, att, val ) {
    var currentValue = obj[att];
    if( typeof val === 'undefined' ) val = currentValue;

    obj[att] = val;
    if ( val === currentValue ) {
        // If the value is the same, we must force the event firing.
        obj[ID][att].event.fire( obj[att], obj, att );
    }
};

/**
 * @param {object} obj - Object to which we want to add a property.
 * @param {string} att - Name of the attribute of `obj`.
 */
exports.prop = propCast.bind( null, null );

exports.propBoolean = propCast.bind( null, converters.castBoolean );
exports.propColor = propCast.bind( null, converters.castColor );
exports.propEnum = function( enumeration ) {
    return propCast.bind( null, converters.castEnum( enumeration ) );
};
exports.propInteger = propCast.bind( null, converters.castInteger );
exports.propString = propCast.bind( null, converters.castString );
exports.propStringArray = propCast.bind( null, converters.castStringArray );
exports.propUnit = propCast.bind( null, converters.castUnit );
exports.propValidator = propCast.bind( null, converters.castValidator );

exports.bind = function( srcObj, srcAtt, dstObj, dstAtt, options ) {
    if( typeof srcObj[ID] === 'undefined' || typeof srcObj[ID][srcAtt] === 'undefined' ) {
        console.error( srcAtt + " is not a bindable property of ", srcObj );
        throw Error( srcAtt + " is not a bindable property!" );
    }

    if( typeof options === 'undefined' ) options = {};

    var lambda = typeof dstObj === 'function' ? dstObj : function(v, obj, att) {
        dstObj[dstAtt] = typeof options.converter === 'function' ? options.converter(v) : v;
    };
    srcObj[ID][srcAtt].event.add( lambda );

    return options;
};


exports.extend = function( def, ext, obj ) {
    var out = JSON.parse( JSON.stringify( def ) );

    var key, val;
    for( key in ext ) {
        if (key.charAt(0) == '$') continue;
        val = ext[key];
        if( typeof out[key] === 'undefined' ) {
            console.error("[tfw.data-binding.extend] Undefined argument: `" + key + "`!");
        } else {
            out[key] = val;
        }
    }

    if (typeof obj !== 'undefined') {
        for( key in ext ) {
            if (key.charAt(0) != '$') continue;
                Object.defineProperty( obj, key, {
                    value: ext[key],
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
        }
        // Setting values.
        for( key in out ) {
            if (key.charAt(0) == '$') continue;
            obj[key] = out[key];
        }
    }

    return out;
};


exports.converters = converters;
