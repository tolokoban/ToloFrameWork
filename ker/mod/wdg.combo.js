var $ = require("dom");
var DB = require("tfw.data-binding");
var Icon = require("wdg.icon");
var Modal = require("wdg.modal");
var Button = require("wdg.button");


/**
 * @export @class
 *
 *
 * __Attributes__:
 * * {string} `label`:
 * * {string} `value`:
 * * {array|object} `content`:
 * * {boolean} `enabled`:
 * * {boolean} `focus`:
 * * {boolean} `wide`:
 * * {boolean} `visible`:
 */
var Combo = function(opts) {
    var that = this;

    this._children = {};
    var label = $.div( 'theme-label', 'theme-color-bg-1' );
    var button = $.div( 'button', 'theme-color-bg-1', [new Icon({content: 'tri-down', size: '1.5rem'})] );
    var body = $.tag( 'button', 'body' );
    var datalist = $.div( 'datalist' );
    this._button = button;
    var elem = $.elem( this, 'div', 'wdg-combo', 'theme-elevation-2',
                       [label, $.div('table', [body, button]), datalist] );

    body.addEventListener('focus', function() {
        $.addClass( elem, 'theme-elevation-8' );
    });
    body.addEventListener('blur', function() {
        $.removeClass( elem, 'theme-elevation-8' );
    });
    DB.propRemoveClass(this, 'enabled', 'disabled');
    DB.propBoolean(this, 'focus')(function(v) {
        if (v) body.focus();
        else body.blur();
    });
    DB.propString(this, 'label')(function(v) {
        if (v === null || (typeof v === 'string' && v.trim() == '')) {
            $.addClass(elem, 'no-label');
        } else {
            $.removeClass(elem, 'no-label');
            $.textOrHtml(label, v);
            if (v.substr(0, 6) == '<html>') {
                $.att(label, {title: ''});
            } else {
                $.att(label, {title: v});
            }
        }
    });
    DB.prop(this, 'content')(function(v) {
        if (Array.isArray( v )) {
            // Convert array into map.
            // Each item must have the `$key` property.
            // If not, the element is ignored.
            var obj = {};
            v.forEach(function (itm, idx) {
                if( typeof itm.$key === 'undefined' ) return;
                obj[itm.$key] = itm;
            });
            v = obj;
        }
        that._children = v;
        DB.fire( that, 'value' );
    });
    DB.propString(this, 'value')(function(v) {
        var selectedItem = that._children[v];
        if( typeof selectedItem === 'undefined' ) {
            for( v in that._children ) break;
            selectedItem = that._children[v];
        }
        $.clear( body );
        if (!selectedItem) return;
        $.add( body, selectedItem );
    });
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        value: '',
        content: [],
        label: null,
        enabled: true,
        wide: false,
        visible: true
    }, opts, this);

    $.on( elem, that.fire.bind( that ) );
};

/**
 * @return void
 */
Combo.prototype.fire = function() {
    var modalChildren = [];
    if (typeof this.label === 'string') {
        // If there is a label for this combo, we have to repeat it in the modal.
        var label = $.div('theme-label', 'theme-color-bg-1');
        $.textOrHtml( label, this.label );
        modalChildren.push( label );
    }
    
    var ul = $.tag('ul', 'wdg-combo-modal', 'theme-color-bg-B0');
    modalChildren.push( ul );

    var btnCancel = new Button({icon: 'cancel', text: _('cancel'), type: 'simple'});
    modalChildren.push( btnCancel );
    
    var modal = new Modal({content: modalChildren, wide: false});
    document.body.appendChild( modal.element );
    modal.visible = true;

    function close() {
        modal.visible = false;
        document.body.removeChild( modal.element );
    }
    DB.bind(btnCancel, 'action', close);

    var key, val, container;
    for( key in this._children ) {
        if (key == this.value) continue;
        val = this._children[key];
        if (typeof val.element === 'function') {
            val = val.element();
        }
        else if (typeof val.element !== 'undefined') {
            val = val.element;
        }
        container = $.tag('li', 'theme-elevation-0', [val]);
        $.add( ul, container );
        attachEvent.call( this, key, container, close );
    }
};

/**
 * @export toArray @function
 * Arrays are useful for HTML content. But, for code, it is easier to write objects.
 * This function will create an array while assigning `$key` attribute to each element.
 */
Combo.toArray = function( obj ) {
    var key, val, div, output = [];
    for( key in obj ) {
        val = obj[key];
        if (typeof val === 'string') {
            div = document.createElement( 'div' );
            div.textContent = val;
            val = div;
        }
        val.$key = key;
        output.push( val );
    }

    return output;
};


function attachEvent( key, elem, close ) {
    var that = this;

    $.on(elem, {
        down: function() {
            window.setTimeout(function() {
                $.addClass(elem, 'theme-elevation-4');
            });
        },
        up: function() {
            $.removeClass(elem, 'theme-elevation-4');
        },
        tap: function() {
            console.log("Select: ", key);
            close();
            that.value = key;
        }
    });
}

module.exports = Combo;
