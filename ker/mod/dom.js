require("polyfill.classList");

// Used to store data on the DOM element without colliding with existing attributes.
var SYMBOL = '$' + Date.now();


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
exports.get = get;
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
 * @param element {object|array} - list of elements on which apply events handlers.
 * @param  slots {object|function}  - If  a function  is given,  it is
 * considered as a slot for the event `tap`.
 * Otherwise, the object is a map  between events' names (the key) and
 * function to handle the event (the value).
 * Events' names are:
 * * __tap__: When  the element is  pressed and released in  less than
 900 ms and without too much sliding.
 * @param capture {boolean} - If `true` events are captured before they reach the children.
 * @example
 *    DOM.on( [screen, button], function() {...} );
 *    DOM.on( body, null );   // Do nothing, but stop propagation.
 *    DOM.on( element, { tap: function() {...} } );
 */
exports.on = on;
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
    oldElem.parentNode.replaceChild( newElem, oldElem );
    return newElem;
}

function css( element, styles ) {
    var key, val;
    for( key in styles ) {
        val = styles[key];
        element.style[key] = val;
    }
    return element;
}

function att( element, attribs ) {
    var key, val;
    for( key in attribs ) {
        val = attribs[key];
        element.setAttribute( key, val );
    }
    return element;
}

function add( element ) {
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
            element.appendChild( child );
        }
        return element;
    }
    catch( ex ) {
        console.error( "[DOM.add] arguments=", [].slice.call( arguments ) );
        throw Error( "[DOM.add] " + ex );
    }
}

function on( element, slots, capture ) {
    // If only a function is passed, we consider this is a Tap event.
    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };

    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            on( elem, slots );
        });
        return element;
    }

    // If `touched` is true, we must delete mouse events.
    var touched = false;
    var x0, y0, t0;

    // @TODO Change `click` for something more suitable to touch events.
    element.addEventListener( 'click', function(evt) {
        var tap = slots.tap;
        if( typeof tap === 'function' || tap === null ) {
            evt.stopPropagation();
            if( tap !== null ) tap( element );
        }
    }, capture);

    return element;
}

function tagNS( ns, name ) {
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
    args.forEach(function (className) {
        if( typeof className === 'string' ) {
            className = className.trim();
            if( className.length == 0 ) return;
            try {
                elem.classList.add( className );
            }
            catch( ex ) {
                console.error( "[dom.addClass] Invalid class name: ", className );
                console.error( ex );
            }
        }
    });
    return elem;
}


function hasClass( elem, className ) {
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
    args.forEach(function (className) {
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
    if( typeof query === 'undefined' ) {
        query = element;
        element = window.document;
    }
    return element.querySelector( query );
}

function detach( element ) {
    var parent = element.parentElement;
    if( !parent ) return parent;
    parent.removeChild( element );
    return parent;
}
