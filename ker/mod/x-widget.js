"use strict";
var $ = require("dom");
var DB = require("tfw.data-binding");

var widgets = {};
// Used for `onWidgetCreation()`.
var slots = {};


var Widget = function(id, modName, args) {
    if (typeof id === 'string') return Widget1.call( this, id, modName, args );
    else return Widget2.call( this, id );
};

function Widget1(id, modName, args ) {
    try {
        var module = require( modName );
        var wdg = new module( args );
        var elem = typeof wdg.element === 'function' ? wdg.element() : wdg.element;
        elem.setAttribute( 'id', id );
        var dst = document.getElementById( id );
        if (dst) {
            // This widget does exist in the current DOM.
            // We have to replace it.
            dst.parentNode.replaceChild( elem, dst );
        }
        register( id, wdg );
        return wdg;
    }
    catch (ex) {
        console.error("[x-widget] Unable to create widget `" + modName + "`!");
        console.error("[x-widget] id = ", id, ", args = ", args);
        throw Error(ex);
    }
};

/**
 * @example
 var W = require("x-widget");
 W({
 elem: "div",
 attr: {"class": "black"},
 prop: {"$key": "menu"},
 children: [
 "This is the ",
 W({
 elem: "b",
 children: ["menu"]}),
 "..."]});
 */
function Widget2(args) {
    var id;
    var elem = $.tag( args.elem );
    if (args.attr) {
        // Adding DOM element attributes.
        $.att( elem, args.attr );
        id = args.attr.id;
    }

    if (Array.isArray( args.children )) {
        // Adding DOM element children.
        args.children.forEach(function (child) {
            $.add( elem, child );
        });
    }
    // Converting into a widget.
    var key, val;
    var wdg = {};

    if (args.prop) {
        // Adding READ-ONLY properties to the widget.
        for( key in args.prop ) {
            val = args.prop[key];
            Object.defineProperty( wdg, key, {
                value: val, writable: false, configurable: false, enumerable: true
            });
        }
    }
    // Assigning the element to the widget.
    Object.defineProperty( wdg, 'element', {
        value: elem, writable: false, configurable: false, enumerable: true
    });

    if( typeof id !== 'undefined' ) {
        // Registering the widget only if it as got an id.
        register( id, wdg );
    }
    return wdg;
}

Widget.template = function( attribs ) {
    var key, val, id, name = '', args = {};
    for( key in attribs ) {
        val = attribs[key];
        if( key == 'name' ) {
            name = val;
        }
        else if( key == 'id' ) {
            id = val;
        }
        else if( key.charAt(0)=='$' ) {
            args[key.substr( 1 )] = val;
        }
    }
    var module = require( name );
    var wdg = new module( args );
    if( id ) {
        register( id, wdg );
    }

    return typeof wdg.element === 'function' ? wdg.element() : (wdg.element || wdg);
};

function register( id, wdg ) {
    widgets[id] = wdg;
    var mySlots = slots[id];
    if( typeof mySlots !== 'undefined' ) {
        window.setTimeout(function() {
            mySlots.forEach(function (slot) {
                slot( wdg );
            });
            delete slots[id];
        });
    }
    return typeof wdg.element === 'function' ? wdg.element : (wdg.element || wdg);
};

Widget.getById = function( id ) {
    if( !widgets[id] ) throw Error( "[x-widget.getById()] ID not found: " + id + "!" );
    return widgets[id];
};

Widget.onWidgetCreation = function( id, slot ) {
    if( typeof widgets[id] === 'undefined' ) {
        if( typeof slots[id] === 'undefined' ) slots[id] = [slot];
        else slots[id].push( slot );
    } else {
        // Asynchronous call to the slot
        window.setTimeout(
            function() {
                slot( widgets[id] );
            }
        );
    }
};

/**
 * @example
 * var W = require("x-widget");
 * W.bind('wdg.layout-stack0',{"value":{"B":[["btnNewTask","action"],["btnCancel","action"]]}});
 */
Widget.bind = function( id, attribs ) {
    // Destination object: the one on the attributes of which we want to bind.
    var dstObj = widgets[id];
    // Destination attribute name.
    var dstAtt;
    // Temporary variables to hold source object and attributes.
    var srcObj, srcAtt;
    // @example
    // ["btnNewTask","action","btnCancel","action"]
    var bindings;
    var slots;
    // Index used to parse multiple bindings.
    var idx;
    for( dstAtt in attribs ) {
        bindings = attribs[dstAtt].B;
        if (Array.isArray( bindings )) {
            // `binding` is an array of arrays.
            // Subarrays have 2 or 3 elements.
            // * ID if the source object
            // * attribute to bind on
            // * [optional] value  to use as  a constant. This  is the
            // * case where  we just want  to set a constant  value as
            // * soon as the source's attribute has changed.
            bindings.forEach(function (binding) {
                srcObj = widgets[binding[0]];
                if( typeof srcObj === 'undefined' ) {
                    console.error( "[x-widget:bind] Trying to bind attribute \"" + dstAtt
                                   + "\" of widget \"" + id + "\" to the unexisting widget \""
                                   + binding[0] + "\"!");
                    return;
                }
                srcAtt = binding[1];
                if (binding.length == 2) {
                    DB.bind( srcObj, srcAtt, dstObj, dstAtt );
                } else {
                    var value = binding[2];
                    DB.bind( srcObj, srcAtt, function() {
                        dstObj[dstAtt] = value;
                    });
                }
            });
        }

        slots = attribs[dstAtt].S;
        if (Array.isArray( slots )) {
            // Each item is the name of a function to call when the value of this attribute changes.
            // If the item is a `string`, the function is from the global `APP` object.
            // Otherwise, the item must be an array with two children:
            // the first one  is the module's name and  the second one
            // id the name of the function.
            // The slots are called with two arguments:
            //  * the value and
            //  * the object the attribute belongs.
            slots.forEach(function (slot) {
                var mod = APP;
                var fct = slot;
                if (Array.isArray( slot )) {
                    mod = require(slot[0]);
                    fct = slot[1];
                }
                fct = mod[fct];
                if (typeof fct !== 'function') {
                    console.error("[x-widget:bind] slot not found: ", slot);
                } else {
                    DB.bind( dstObj, dstAtt, fct );
                }
            });

        }
    }
};

module.exports = Widget;
