var $ = require("dom");
var Wdg = require("x-widget");
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
        var icon = $.div(
            {title: name},
            [
                new Icon({content: name, size: '2em'})
            ]);
        $.on( icon, {
            tap: function() {
                Wdg.getById('txtContent').value = name;
            },
            doubletap: function() {
                Wdg.getById('txtContent').value = JSON.stringify( Icon.Icons[name], null, '  ' );
            }
        });
        $.add( elem, icon );
    });
};



module.exports = X;
