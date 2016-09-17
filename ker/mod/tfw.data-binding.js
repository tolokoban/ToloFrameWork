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
var $ = require("dom");
var Listeners = require("tfw.listeners");


var ID = '_tfw.data-binding_';

var converters = {
    castArray: function(v) {
        if (Array.isArray( v )) return v;
        return [v];
    },
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
    castRegexp: function(v) {
        if (v instanceof RegExp) return v;
        if (typeof v === 'string' && v.trim().length != 0 ) {
            try {
                return new RegExp( v );
            }
            // Ignore Regular Expression errors.
            catch (ex) {
                console.error("[castRegexp] /" + v + "/ ", ex);
            }
        };
        return null;
    },
    castString: function(v) {
        if (typeof v === 'string') return v;
        if (v === undefined || v === null) return '';
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

/**
 * @param {any|function} val - Default value, or a specific getter (if `val` is a function).
 */
function propCast( caster, obj, att, val ) {
    var hasSpecialGetter = typeof val === 'function';
    if( typeof obj[ID] === 'undefined' ) obj[ID] = {};
    obj[ID][att] = {
        value: val,
        event: new Listeners()
    };
    var setter;
    if (typeof caster === 'function') {
        setter = function(v) {
            v = caster( v );
            // If there is a special getter, any set will fire.
            // Otherwise, we fire only if the value has changed.
            if( hasSpecialGetter || obj[ID][att].value !== v) {
                obj[ID][att].value = v;
                obj[ID][att].event.fire( v, obj, att );
            }
        };
    } else {
        setter = function(v) {
            // If there is a special getter, any set will fire.
            // Otherwise, we fire only if the value has changed.
            if( hasSpecialGetter || obj[ID][att].value !== v ) {
                obj[ID][att].value = v;
                obj[ID][att].event.fire( v, obj, att );
            }
        };
    }
    var getter = val;
    if (!hasSpecialGetter) {
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

/**
 * @export @function fire
 *
 * Set a new value and fire the event even if the value has not changed.
 */
exports.fire = function( obj, att, val ) {
    var currentValue = obj[att];
    if( typeof val === 'undefined' ) val = currentValue;

    obj[ID][att].value = val;
    obj[ID][att].event.fire( obj[att], obj, att );
};

/**
 * @export @function set
 *
 * Set a new value without firing any event.
 */
exports.set = function( obj, att, val ) {
    obj[ID][att].value = val;
};

/**
 * @param {object} obj - Object to which we want to add a property.
 * @param {string} att - Name of the attribute of `obj`.
 */
exports.prop = propCast.bind( null, null );
/**
 * @export @function propToggleClass
 * Create an enum attribute which toggles a CSS class when assigned.
 *
 * @param {array|object} values - If this is an array, we will convert
 * it  into an  object.  For instance `["show",  "hide"]` will  become
 * `{show: "show", hide: "hide"}`.
 */
exports.propToggleClass = function( target, attribute, values, prefix ) {
    if( typeof prefix !== 'string' ) prefix = '';
    var convertedValues = {};
    if (typeof values === 'string') {
        convertedValues[values] = values;
    }
    else if (Array.isArray(values)) {
        values.forEach(function (itm) {
            convertedValues[itm] = itm;
        });
    }
    else {
        convertedValues = values;
    }
    propCast( null, target, attribute )(function(v) {
        var key, val;
        for( key in convertedValues ) {
            val = convertedValues[key];
            if (key == v) {
                $.addClass( target.element, prefix + val);
            } else {
                $.removeClass( target.element, prefix + val);
            }
        }
    });
};
/**
 * @export @function propAddClass
 * Create a boolean attribute that toggle a CSS class on the `element` attribute of `target`.
 * If the value id `true`, `className` is added.
 * @example
 * DB.propAddClass( this, 'wide', 'fullscreen' );
 * DB.propAddClass( this, 'wide' );
 */
exports.propAddClass = function( target, attribute, className ) {
    if( typeof className === 'undefined' ) className = attribute;
    propCast( converters.castBoolean, target, attribute )(function(v) {
        if (v) $.addClass( target.element, className );
        else $.removeClass( target.element, className );
    });
};
/**
 * @export @function propAddClass
 * Create a boolean attribute that toggle a CSS class on the `element` attribute of `target`.
 * If the value id `true`, `className` is removed.
 * @example
 * DB.propRemoveClass( this, 'visible', 'hide' );
 */
exports.propRemoveClass = function( target, attribute, className ) {
    if( typeof className === 'undefined' ) className = attribute;
    propCast( converters.castBoolean, target, attribute )(function(v) {
        if (v) $.removeClass( target.element, className );
        else $.addClass( target.element, className );
    });
};
exports.propArray = propCast.bind( null, converters.castArray );
exports.propBoolean = propCast.bind( null, converters.castBoolean );
exports.propColor = propCast.bind( null, converters.castColor );
exports.propEnum = function( enumeration ) {
    return propCast.bind( null, converters.castEnum( enumeration ) );
};
exports.propInteger = propCast.bind( null, converters.castInteger );
exports.propRegexp = propCast.bind( null, converters.castRegexp );
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
    if (options.value) {
        options.converter = function() {
            return options.value;
        };
    }
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
