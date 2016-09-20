/**
 * @module wdg.modal
 *
 * @description
 *
 *
 * @example
 * var mod = require('wdg.modal');
 */
var $ = require("dom");
var DB = require("tfw.data-binding");
var Flex = require("wdg.flex");
var Button = require("wdg.button");


function Modal( opts ) {
    var that = this;

    var body = $.div( 'theme-elevation-24', 'theme-color-bg-B3' );
    var cell = $.div( [body] );
    var elem = $.elem( this, 'div', 'wdg-modal', [cell] );

    DB.prop(this, 'content')(function(v) {
        $.clear( body );
        if (Array.isArray( v )) {
            v.forEach(function (itm) {
                $.add( body, itm );
            });
        } else if (typeof v !== 'undefined' && v !== null){
            $.add( body, v );
        }
    });
    DB.propAddClass(this, 'padding');
    DB.propAddClass(this, 'scroll');
    DB.propAddClass(this, 'wide');
    DB.propRemoveClass(this, 'visible', 'hide');

    opts = DB.extend({
        visible: false, content: [], padding: false, scroll: true
    }, opts, this );
}


/**
 * @member Modal.refresh
 * Refresh the content.
 */
Modal.prototype.refresh = function() {
    DB.fire( this, 'content' );
    return this;
};

/**
 * @member Modal.attach
 * Append element to body.
 */
Modal.prototype.attach = function() {
    document.body.appendChild( this.element );
    this.visible = true;
};

/**
 * @member Modal.detach
 * Remove element from body.
 */
Modal.prototype.detach = function() {
    this.visible = false;
    document.body.removeChild( this.element );
};

/**
 * @function Modal.comfirm
 */
Modal.confirm = function( content, onYes, onNo ) {
    var btnNo = Button.No();
    var btnYes = Button.Yes('warning');
    var buttons = $.div([$.tag('hr'), new Flex({ content: [btnNo, btnYes] })]);
    if (typeof content === 'string' && content.substr(0, 6) == '<html>') {
        // This is HTML code.
        var html = content.substr(6);
        content = $.div();
        content.innerHTML = html;
    }
    var modal = new Modal({ content: $.div([content, buttons]), padding: true });
    modal.attach();

    btnNo.on(function() {
        modal.detach();
        if (typeof onNo === 'function') {
            onNo();
        }
    });
    btnYes.on(function() {
        modal.detach();
        if (typeof onYes === 'function') {
            onYes();
        }
    });
};

module.exports = Modal;
