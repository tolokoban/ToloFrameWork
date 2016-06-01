/** @module wdg.checkbox */require( 'wdg.checkbox', function(exports, module) {  var $ = require("dom");
var DB = require("tfw.data-binding");

var Checkbox = function(opts) {
    var that = this;

    var elem = $.elem( this, 'button', 'wdg-checkbox' );

    DB.propBoolean(this, 'value')(function(v) {
        if (v) {
            $.addClass( elem, 'checked' );
        } else {
            $.removeClass( elem, 'checked' );
        }
    });
    DB.propString(this, 'text')(function(v) {
        elem.textContent = v;
    });
    DB.propInteger(this, 'action', 0);

    DB.extend({
        value: false,
        text: "checked",
        wide: false,
        visible: true
    }, opts, this);

    $.on( elem, {
        tap: this.fire.bind( this ),
        keydown: function( evt ) {
            if (evt.keyCode == 13 || evt.keyCode == 32) {
                evt.preventDefault();
                evt.stopPropagation();
                that.fire();
            }
        }
    });

    this.focus = elem.focus.bind( elem );
};

/**
 * @return void
 */
Checkbox.prototype.fire = function() {
    this.value = !this.value;
};



module.exports = Checkbox;



 
/**
 * @module wdg.checkbox
 * @see module:dom
 * @see module:tfw.data-binding
 * @see module:wdg.checkbox

 */
});