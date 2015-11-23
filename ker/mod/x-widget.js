"use strict";


module.exports = function(id, modName, args) {
    var module = require(modName);
    var dst = document.getElementById(id);
    var src = new module(args);
    src.element().$ctrl = src;
    src = src.element();
    src.setAttribute('id', id);
    dst.parentNode.replaceChild(src, dst);
};
