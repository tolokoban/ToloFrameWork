var $ = require("dom");
var DB = require("tfw.data-binding");
var Touchable = require("tfw.touchable");

/**
 * @param opts.value {boolean} - `true` if checked, `false` otherwise.
 * @param opts.text {string} - Text to display.
 * @param opts.wide {boolean} - If `true`, expand on whole line.
 * @param opts.visible {boolean} - Show/hide this widget.
 */
var Checkbox = function(opts) {
    var that = this;

    var spinner = $.div('wdg-checkbox-spin',
                        [$.div([$.div('theme-elevation-4'), $.div('theme-elevation-4')])]);
    var text = $.div('label');
    var elem = $.elem( this, 'button', 'wdg-checkbox', [spinner, text] );

    DB.propAddClass(this, 'value', 'checked' );
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

    var touchable = new Touchable( elem );
    touchable.tap.add( this.fire.bind( this ) );
    $.on( elem, {
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
