/**
 * @module dom
 *
 * @description
 * Functions which facilitate DOm manipulations.
 * Included __interact.js__. You can find documentation for it here:
 * [http://interactjs.io/docs/]
 *
 * @example
 * var mod = require('dom');
 */
require("polyfill.classList");
var PointerEvents = require("tfw.pointer-events");


// Used to store data on the DOM element without colliding with existing attributes.
var SYMBOL = 'dom' + Date.now();


exports.tagNS = tagNS;
exports.svgRoot = tagNS.bind( undefined, "http://www.w3.org/2000/svg", "svg", {
    version: '1.1',
    'xmlns:svg': 'http://www.w3.org/2000/svg',
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
});
exports.svg = tagNS.bind( undefined, "http://www.w3.org/2000/svg" );
exports.tag = tagNS.bind( undefined, "http://www.w3.org/1999/xhtml" );
exports.div = tagNS.bind( undefined, "http://www.w3.org/1999/xhtml", "div" );
exports.txt = window.document.createTextNode.bind( window.document );
exports.textOrHtml = textOrHtml;
exports.get = get;
/**
 * Add a readonly `element` property to `obj` and return it.
 */
exports.elem = elem;
/**
 * Apply css rules on `element`.
 *
 * @return `element`.
 *
 * @example
 * var $ = require('dom');
 * $.css( element, { width: '800px'. height: '600px' });
 */
exports.css = css;
exports.att = att;
exports.removeAtt = removeAtt;
exports.addClass = addClass;
exports.hasClass = hasClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
/**
 * @param newElem {Element} - Replacement element.
 * @param oldElem {Element} - Element to replace.
 */
exports.replace = replace;
/**
 * Remove element from its parent.
 * @param element {Element} - Element to detach from its parent.
 * @return The parent element.
 */
exports.detach = detach;
/**
 * Add event handlers to one or many elements.
 *
 * @param {object|array}  element -  list of  elements on  which apply
 * events handlers.
 *
 * @param  {object|function} slots  - If  a function  is given,  it is
 * considered as a slot for the event `tap`.  Otherwise, the object is
 * a map  between events' names (the  key) and function to  handle the
 * event (the value).
 * Events' names are:
 * * __tap__: When  the element is  pressed and released in  less than
 900 ms and without too much sliding.
 * * __doubletap__
 * * __dragmove__
 *
 * @param {boolean} capture - If `true` events are captured before they reach the children.
 *
 * @example
 *    DOM.on( [screen, button], function() {...} );
 *    DOM.on( body, null );   // Do nothing, but stop propagation.
 *    DOM.on( element, { tap: function() {...} } );
 */
exports.on = on;
exports.off = off;
/**
 * Append all the `children` to `element`.
 * @param element
 * @param ...children
 */
exports.add = add;
/**
 * Add the attribute `element` and the following functions to `obj`:
 * * __css__
 * * __addClass__
 * * __removeClass__
 * * __toggleClass__
 */
exports.wrap = wrap;
/**
 * Remove all children of the `element`.
 * @param element {Element} - Element from which remove all the children.
 */
exports.clear = clear;

function wrap( obj, element, nomethods ) {
    Object.defineProperty( obj, 'element', {
        value: element, writable: false, configurable: false, enumerable: true
    });
    if( nomethods ) return obj;

    obj.on = on.bind( obj, element );
    obj.css = css.bind( obj, element );
    obj.add = add.bind( obj, element );
    obj.att = att.bind( obj, element );
    obj.addClass = addClass.bind( obj, element );
    obj.hasClass = hasClass.bind( obj, element );
    obj.removeClass = removeClass.bind( obj, element );
    obj.toggleClass = toggleClass.bind( obj, element );
    return obj;
}

function replace( newElem, oldElem ) {
    newElem = extract(newElem);
    oldElem = extract(oldElem);
    oldElem.parentNode.replaceChild( newElem, oldElem );
    return newElem;
}

function css( element, styles ) {
    element = extract(element);
    var key, val;
    for( key in styles ) {
        val = styles[key];
        element.style[key] = val;
    }
    return element;
}

function att( element, attribs, value ) {
    element = extract(element);
    var key, val;
    if (typeof attribs === 'string') {
        key = attribs;
        attribs = {};
        attribs[key] = value;
    }
    for( key in attribs ) {
        val = attribs[key];
        element.setAttribute( key, val );
    }
    return element;
}

function removeAtt( element, attrib ) {
    element = extract(element);
    element.removeAttribute( attrib );
    return element;
}

function add( element ) {
    element = extract(element);
    try {
        var i, child;
        for (i = 1 ; i < arguments.length ; i++) {
            child = arguments[i];
            if( typeof child === 'string' || typeof child === 'number' ) {
                child = document.createTextNode( child );
            }
            else if( typeof child.element === 'function' ) {
                // Backward compatibility with Widgets.
                child = child.element();
            }
            else if( typeof child.element !== 'undefined' ) {
                child = child.element;
            }
            element.appendChild( child );
        }
        return element;
    }
    catch( ex ) {
        console.error( "[DOM.add] arguments=", [].slice.call( arguments ) );
        throw Error( "[DOM.add] " + ex );
    }
}

function off( element ) {
    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            off( elem );
        });
        return element;
    }

    var pe = element[SYMBOL];
    if( typeof pe  === 'undefined' ) return element;
    pe.off();
    delete element[SYMBOL];
}

function on( element, slots ) {
    // If only a function is passed, we consider this is a Tap event.
    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };

    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            on( elem, slots );
        });
        return element;
    }

    if( typeof element[SYMBOL] === 'undefined' ) {
        element[SYMBOL] = new PointerEvents( element );
    }

    var key, val, preview;
    for( key in slots ) {
        val = slots[key];
        if (key.charAt(0) == '!') {
            key = key.substr(1);
            preview = true;
        } else {
            preview = false;
        }
        if (key == 'keydown' || key == 'keyup') {
            element.addEventListener( key, val, preview );
        } else {
            element[SYMBOL].on( key, val, preview );
        }
    }

    return element;
}

function tagNS( ns, name ) {
    try {
        var e = document.createElementNS( ns, name );
        var i, arg, key, val;
        for (i = 2 ; i < arguments.length ; i++) {
            arg = arguments[i];
            if( Array.isArray(arg) ) {
                // Array are for children.
                arg.forEach(function (child) {
                    switch( typeof child ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        child = document.createTextNode( "" + child );
                        break;
                    }
                    add( e, child );
                });
            } else {
                switch( typeof arg ) {
                case "string":
                    arg.split( ' ' ).forEach(function ( item ) {
                        if( item.length > 0 ) {
                            addClass(e, item);
                        }
                    });
                    break;
                case "object":
                    for( key in arg ) {
                        val = arg[key];
                        e.setAttribute( key, val );
                    }
                    break;
                default:
                    throw Error("[dom.tag] Error creating <" + name + ">: Invalid argument #" + i + "!");
                }
            }
        }
        return e;
    }
    catch (ex) {
        console.error("[dom.tagNS] Error with `ns` = ", ns, " and `name` = ", name);
        console.error(ex);
    }
};


function addClass(elem) {
    var args = [].slice.call( arguments, 1 );
    if( Array.isArray( elem ) ) {
        // Loop on each element.
        args.unshift( null );
        elem.forEach(function ( child ) {
            args[0] = child;
            addClass.apply( undefined, args );
        });
        return elem;
    }
    elem = extract( elem );
    args.forEach(function (className) {
        if (typeof className !== 'string') return;
        className = className.trim();
        if( className.length == 0 ) return;
        try {
            elem.classList.add( className );
        }
        catch( ex ) {
            console.error( "[dom.addClass] Invalid class name: ", className );
            console.error( ex );
        }
    });
    return elem;
}


function hasClass( elem, className ) {
    elem = extract( elem );
    return elem.classList.contains( className );
}


function removeClass(elem) {
    var args = [].slice.call( arguments, 1 );
    if( Array.isArray( elem ) ) {
        // Loop on each element.
        args.unshift( null );
        elem.forEach(function ( child ) {
            args[0] = child;
            removeClass.apply( undefined, args );
        });
        return elem;
    }
    elem = extract( elem );
    args.forEach(function (className) {
        if (typeof className !== 'string') return;
        try {
            elem.classList.remove( className );
        }
        catch( ex ) {
            console.error( "[dom.removeClass] Invalid class name: ", className );
            console.error( ex );
        }
    });
    return elem;
}


function toggleClass(elem) {
    var args = [].slice.call( arguments, 1 );
    args.forEach(function( className ) {
        if( hasClass( elem, className ) ) {
            removeClass( elem, className );
        } else {
            addClass( elem, className );
        }
    });
    return elem;
}


function clear( element ) {
    // (!) On préfère retirer les éléments un par un du DOM plutôt que d'utiliser simplement
    // this.html("").
    // En effet, le code simplifié a des conséquences inattendues dans IE9 et IE10 au moins.
    // Le bug des markers qui disparaissaients sur les cartes de Trail-Passion 4 a été corrigé
    // avec cette modification.
    element = extract(element);
    var e = element;
    while(e.firstChild){
        e.removeChild(e.firstChild);
    }
    var args = [].slice.call( arguments );
    if( args.length > 1 ) {
        add.apply( this, args );
    }
    return element;
}

function get( element, query ) {
    element = extract(element);
    if( typeof query === 'undefined' ) {
        query = element;
        element = window.document;
    }
    return element.querySelector( query );
}

function detach( element ) {
    element = extract(element);
    var parent = element.parentElement;
    if( !parent ) return parent;
    parent.removeChild( element );
    return parent;
}

function elem( target ) {
    var args = [].slice.call( arguments );
    args.shift();
    if (args.length == 0) args = ['div'];
    args.push('dom', 'custom');
    var e;
    if (typeof args[0].element !== 'undefined') {
        e = args[0].element;
        addClass( e, 'dom', 'custom' );
    } else if (typeof args[0].appendChild === 'function') {
        e = args[0];
        addClass( e, 'dom', 'custom' );
    } else {
        e = exports.tag.apply( exports, args );
    }
    Object.defineProperty( target, 'element', {
        value: e, writable: false, configurable: false, enumerable: true
    });
    return e;
}

function textOrHtml( element, content ) {
    if( typeof content === 'undefined' ) content = '';
    if (content === null) content = '';
    if (typeof content !== 'string') content = JSON.stringify( content );
    if (content.substr(0, 6) == '<html>') {
        element.innerHTML = content.substr(6);
    } else {
        element.textContent = content;
    }
    return element;
}

function extract(dom) {
    if (typeof dom === 'string') {
        var elem = document.getElementById( dom );
        if (!elem) {
            throw Error("There is no DOM element with this ID: `" + dom + "`");
        }
        return elem;
    }
    if (!dom) {
        debugger;
        throw Error("`dom` is not a valid element!", dom);
    }
    if (typeof dom.element === 'function') return dom.element();
    if (dom.element) return dom.element;
    return dom;
}
