/**
 * @module tfw.data-binding
 *
 * @description
 * Provide all the functions needed for data-binding.
 *
 * @example
 * var mod = require('tfw.data-binding');
 */
var Listeners = require("tfw.listeners");


var ID = '_tfw.data-binding_';


/**
 * @param {object} obj - Object to which we want to add a property.
 * @param {string} att - Name of the attribute of `obj`.
 */
exports.prop = function( obj, att, val ) {
    if( typeof obj[ID] === 'undefined' ) obj[ID] = {};
    obj[ID][att] = {
        value: val,
        event: new Listeners()
    };
    Object.defineProperty( obj, att, {
        get: function() { return obj[ID][att].value; },
        set: function(v) {
            if( obj[ID][att].value !== v ) {
                obj[ID][att].value = v;
                obj[ID][att].event.fire( v, obj, att );
            }
        },
        configurable: false,
        enumerable: true
    });
    return exports.bind.bind(exports, obj, att);
};


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


exports.extend = function( def, opt, att ) {
    var out = JSON.parse( JSON.stringify( def ) );

    if (typeof opt === 'string') {
        if( typeof att !== 'string' ) att = 'value';
        var value = opt;
        opt = {};
        opt[att] = value;
    }

    var key, val;
    for( key in opt ) {
        val = opt[key];
        if( typeof out[key] === 'undefined' ) {
            console.error("[tfw.data-binding.extend] Undefined argument: `" + key + "`!");
        } else {
            out[key] = val;
        }
    }

    return out;
};
