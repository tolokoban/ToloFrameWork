var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");

var Checkbox = function(opts) {
    var that = this;

    var yes = new Icon({content: "ok", size: "1.1em"});
    var no = new Icon({content: "cancel", size: "1.1em"});
    var text = $.div('label');
    var elem = $.elem( this, 'button', 'wdg-checkbox', [yes, no, text] );

    DB.propBoolean(this, 'value')(function(v) {
        if (v) {
            $.addClass( elem, 'checked' );
            yes.visible = true;
            no.visible = false;
        } else {
            $.removeClass( elem, 'checked' );
            yes.visible = false;
            no.visible = true;
        }
    });
    DB.propString(this, 'text')(function(v) {
        text.textContent = v;
    });
    DB.propInteger(this, 'action', 0);
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

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
