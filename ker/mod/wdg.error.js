


var $ = require("dom");
var DB = require("tfw.data-binding");


function Error(opts) {
    var that = this;

    $.elem('div', 'theme-elevation-12', 'wdg-error');

    DB.propString(this, 'text')(function(v) {
        $.textOrHtml(that.element, v);
    });
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend( { text: '', visible: true }, opts, this );
}


module.exports = Error;
