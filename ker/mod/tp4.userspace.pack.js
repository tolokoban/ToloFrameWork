/**********************************************************************
 require( 'tp4.userspace.pack' )
 -----------------------------------------------------------------------
 
 **********************************************************************/
var $ = require("dom");
var WS = require("tfw.web-service");
var Msg = require("tp4.message");

var B = require("tp4.button").create;
var I = require("tp4.input").create;
var LG = require("tfw.layout-grid").create;


function Pack() {
    $.wrap( this, $.div( 'tp4-userspace-pack' ), true );
    var btnCreate = B({ label: _('create-pack') });
    var inpPackName = I({ label: _('new-pack-name'), onEnter: btnCreate });
    var row = LG([ inpPackName, btnCreate ]);
    this.element.appendChild( row.element() );
}



module.exports = Pack;
