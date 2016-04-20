/**********************************************************************
 require( 'dom.input' )
 -----------------------------------------------------------------------

 **********************************************************************/
var $ = require("dom");
var Wdg = require("x-widget");


function Input( args ) {
    if( typeof args === 'undefined' ) args = {};
    var element = $.tag( 'input' );
    $.wrap( this, element );

    [
        'size', 'placeholder', 'type', 'value', 'accept', 'autocomplete', 'autofocus', 'autosave',
        'checked', 'disabled',
        'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
        'height', 'inputmode', 'list', 'min', 'max', 'maxlength', 'minlength',
        'multiple', 'name', 'pattern', 'readonly', 'required', 'selectionDirection',
        'spellcheck', 'src', 'step', 'width'
    ].forEach(function( att ) {
        if( typeof args[att] === 'string' ) {
            $.att( element, att, args[att] );
        }
    });

    if( typeof args.onenter === 'string' ) {

    }
}
