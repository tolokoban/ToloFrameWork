/**
 * The HASH is a very convenient way to deal with the browser history.
 * You can use the `:target` CSS selector, but there are few annoying caveats.
 * This module is a watcher for hash changes. Just pass it a callback as argument.
 * It will be called as soon as the hash changed.
 */
var Listeners = require("tfw.listeners");

var lastHash = "?random-hash." + Date.now();
var timer = 0;
var hash = '';
var args = [];
var listeners = new Listeners();

module.exports = function(onChange) {
    listeners.add( onChange );
    if (!timer) {
        timer = window.setInterval(
            function() {
                var currentHash = window.location.hash;
                if (lastHash == currentHash) return;
                lastHash = currentHash;
                if (currentHash.charAt(0) == '#') {
                    currentHash = currentHash.substr(1);
                }
                hash = currentHash;
                while (currentHash.charAt(0) == '/') {
                    currentHash = currentHash.substr(1);
                }
                args = currentHash.split("/");
                listeners.fire( args, window.location.hash );
            },
            50
        );
    }
};


module.exports.args = function() {
    return args;
};

module.exports.hash = function() {
    return hash;
};
