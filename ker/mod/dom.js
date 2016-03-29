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
exports.txt = document.createTextNode;
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
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
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


function wrap( obj, element ) {
    Object.defineProperty( obj, 'element', {
        value: element, writable: false, configurable: false, enumerable: true
    });
    obj.css = css.bind( obj, element );
    obj.addClass = addClass.bind( obj, element );
    obj.removeClass = removeClass.bind( obj, element );
    obj.toggleClass = toggleClass.bind( obj, element );
}

function css( element, styles ) {
    var key, val;
    for( key in styles ) {
        val = styles[key];
        element.style[key] = val;
    }
    return element;
}

function add( element ) {
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

function on( element, slots, capture ) {
    // If only a function is passed, we consider this is a Tap event.
    if( typeof slots === 'function' || slots === null ) slots = { tap: slots };

    if( Array.isArray( element ) ) {
        element.forEach(function ( elem ) {
            on( elem, slots );
        });
        return;
    }

    // If `touched` is true, we must delete mouse events.
    var touched = false;
    var x0, y0, t0;

    // @TODO Change `click` for something more suitable to touch events.
    element.addEventListener( 'click', function(evt) {
        var tap = slots.tap;
        if( typeof tap === 'function' || tap === null ) {
            evt.stopPropagation();
            evt.preventDefault();
            if( tap !== null ) tap( element );
        }
    }, capture);
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
                addClass(e, arg);
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
        elem.classList.add( className );
    });
    return elem;
};


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
        elem.classList.remove( className );
    });
    return elem;
};


function toggleClass(elem) {
    var args = [].slice.call( arguments, 1 );
    args.forEach(function (className) {
        elem.classList.toggle( className );
    });
    return elem;
};





/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (!("classList" in document.createElement("_"))
        || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

        (function (view) {

            "use strict";

            if (!('Element' in view)) return;

            var
            classListProp = "classList"
            , protoProp = "prototype"
            , elemCtrProto = view.Element[protoProp]
            , objCtr = Object
            , strTrim = String[protoProp].trim || function () {
                return this.replace(/^\s+|\s+$/g, "");
            }
            , arrIndexOf = Array[protoProp].indexOf || function (item) {
                var
                i = 0
                , len = this.length
                ;
                for (; i < len; i++) {
                    if (i in this && this[i] === item) {
                        return i;
                    }
                }
                return -1;
            }
            // Vendors: please allow content code to instantiate DOMExceptions
            , DOMEx = function (type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            }
            , checkTokenAndGetIndex = function (classList, token) {
                if (token === "") {
                    throw new DOMEx(
                        "SYNTAX_ERR"
                        , "An invalid or illegal string was specified"
                    );
                }
                if (/\s/.test(token)) {
                    throw new DOMEx(
                        "INVALID_CHARACTER_ERR"
                        , "String contains an invalid character"
                    );
                }
                return arrIndexOf.call(classList, token);
            }
            , ClassList = function (elem) {
                var
                trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
                , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                , i = 0
                , len = classes.length
                ;
                for (; i < len; i++) {
                    this.push(classes[i]);
                }
                this._updateClassName = function () {
                    elem.setAttribute("class", this.toString());
                };
            }
            , classListProto = ClassList[protoProp] = []
            , classListGetter = function () {
                return new ClassList(this);
            }
            ;
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function () {
                var
                tokens = arguments
                , i = 0
                , l = tokens.length
                , token
                , updated = false
                ;
                do {
                    token = tokens[i] + "";
                    if (checkTokenAndGetIndex(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function () {
                var
                tokens = arguments
                , i = 0
                , l = tokens.length
                , token
                , updated = false
                , index
                ;
                do {
                    token = tokens[i] + "";
                    index = checkTokenAndGetIndex(this, token);
                    while (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                        index = checkTokenAndGetIndex(this, token);
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token, force) {
                token += "";

                var
                result = this.contains(token)
                , method = result ?
                    force !== true && "remove"
                    :
                    force !== false && "add"
                ;

                if (method) {
                    this[method](token);
                }

                if (force === true || force === false) {
                    return force;
                } else {
                    return !result;
                }
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter
                    , enumerable: true
                    , configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    } else {
        // There is full or partial native classList support, so just check if we need
        // to normalize the add/remove and toggle APIs.

        (function () {
            "use strict";

            var testElement = document.createElement("_");

            testElement.classList.add("c1", "c2");

            // Polyfill for IE 10/11 and Firefox <26, where classList.add and
            // classList.remove exist but support only one argument at a time.
            if (!testElement.classList.contains("c2")) {
                var createMethod = function(method) {
                    var original = DOMTokenList.prototype[method];

                    DOMTokenList.prototype[method] = function(token) {
                        var i, len = arguments.length;

                        for (i = 0; i < len; i++) {
                            token = arguments[i];
                            original.call(this, token);
                        }
                    };
                };
                createMethod('add');
                createMethod('remove');
            }

            testElement.classList.toggle("c3", false);

            // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
            // support the second argument.
            if (testElement.classList.contains("c3")) {
                var _toggle = DOMTokenList.prototype.toggle;

                DOMTokenList.prototype.toggle = function(token, force) {
                    if (1 in arguments && !this.contains(token) === !force) {
                        return force;
                    } else {
                        return _toggle.call(this, token);
                    }
                };
            }
            testElement = null;
        }());
    }
}
