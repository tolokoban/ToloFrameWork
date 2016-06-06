var $ = require("dom");
var Icon = require("wdg.icon");

var X = function() {
    var elem = $.elem( this, 'div', 'help-wdg-icon' );

    var names = [];
    var key;
    for( key in Icon.Icons ) {
        names.push( key );
    }
    names.sort();

    names.forEach(function (name) {
        $.add( elem, $.div(
            {title: name},
            [
                new Icon({content: name, size: '2em'})
            ]));
    });
};



module.exports = X;
