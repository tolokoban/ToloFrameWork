try {
  module.exports = function() {
    //--------------------
    // Dependent modules.
    var $ = require('dom');
    var PM = require('tfw.binding.property-manager');
    var Tag = require('tfw.view').Tag;
    var Link = require('tfw.binding.link');
    var View = require('tfw.view');;
    var Converters = require('tfw.binding.converters');
    //-------------------------------------------------------
    // Check if needed functions are defined in code behind.
    View.ensureCodeBehind( CODE_BEHIND, "addWeaponView" );
    //-------------------
    // Global variables.
    var conv_list = Converters.get('list');
    var conv_string = Converters.get('string');
    var conv_integer = Converters.get('integer');
    //-------------------
    // Class definition.
    return function( args ) {
      try {
        if( typeof args === 'undefined' ) args = {};
        this.$elements = {};
        var that = this;
        var pm = PM(this);
        //--------------------
        // Create attributes.
        pm.create("title", { cast: conv_string });
        pm.createAction("actionSave");
        pm.create("weapons", { cast: conv_list });
        pm.create("weapons-per-page", { cast: conv_integer(0) });
        //------------------
        // Create elements.
        var e_ = new Tag('DIV');
        var e_image = new Tag('IMG', ["src","crossOrigin"]);
        this.$elements.image = e_image;
        var e_1 = new Tag('DIV', ["class","textcontent"]);
        $.add( e_, e_image, e_1 );
        //-----------------------
        // Declare root element.
        Object.defineProperty( this, '$', {value: e_.$, writable: false, enumerable: false, configurable: false } );
        
      }
      catch( ex ) {
        console.error('mod/case1.js', ex);
        throw Error('Instantiation error in XJS of "mod/case1.js":\n' + ex);
      }
    };
  }();
}
catch( ex ) {
  throw Error('Definition error in XJS of "mod/case1.js"\n' + ex);
}
