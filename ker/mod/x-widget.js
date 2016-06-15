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
        var dst = document.getElementById( id );
        if (!dst) {
            // This widget does not exist!
            return null;
        }
        var module = require( modName );
        var wdg = new module( args );
        var elem = typeof wdg.element === 'function' ? wdg.element() : wdg.element;
        elem.setAttribute( 'id', id );
        dst.parentNode.replaceChild( elem, dst );
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
    console.info("[x-widget] widget creation=...", id);
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

Widget.bind = function( id, attribs ) {
    var dstObj = widgets[id];
    var dstAtt, binding;
    var srcObj, srcAtt;
    for( dstAtt in attribs ) {
        binding = attribs[dstAtt].B;
        srcObj = widgets[binding[0]];
        if( typeof srcObj === 'undefined' ) {
            console.error( "[x-widget:bind] Trying to bind attribute \"" + dstAtt
                           + "\" of widget \"" + id + "\" to the unexisting widget \""
                           + binding[0] + "\"!");
            return;
        }
        srcAtt = binding[1];
        DB.bind( srcObj, srcAtt, dstObj, dstAtt );
    }
};

module.exports = Widget;
