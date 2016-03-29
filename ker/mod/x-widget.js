"use strict";


module.exports = function(id, modName, args) {
    var dst = document.getElementById( id );
    if (!dst) {
        // This widget does not exist!
        return;
    }
    var module = require( modName );
    var src = new module( args );
    var elem = typeof src.element === 'function' ? src.element() : src.element;
    elem.$ctrl = src;    
    src = elem;
    src.setAttribute( 'id', id );
    dst.parentNode.replaceChild( src, dst );
};
