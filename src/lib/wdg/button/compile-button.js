/**
 * @module Button
 */

var Util = require("../util");

/**
 * Clickable blue button with shadow.
 *
 * Accept two other classes :
 * * __green__ : green style
 * * __red__ : red style
 *
 * @example
 * <w:button fire="add" fire-arg="27">Edit</w:button>
 * <w:button fire="add:27">Edit</w:button>
 * <w:button enabled="1">Edit</w:button>
 * <w:button enabled="editable=1">Action</w:button>
 * <w:button enabled="(mode != 'A') && (lastmode != 'B')">Action</w:button>
 *
 * @param fire Name of the signal to trigger when user clicks on the button.
 * To add an argument, put  it in the "fire-arg" attribute or  add it  tho  this  one separated  by  a colon  (ex: `fire="edit:27"`).
 * @param fire-arg Argument to fire with the signal.
 * @param enabled 
 */
module.exports.compile = function(root) {
    Util.fireable(this, root);    
    root.name = "a";
    root.children = [
        this.Tree.div({"class": "custom container"}, root.children)
    ];
    var enabled = this.Tree.att(root, "enabled");
    if (enabled !== undefined) {
        var result = Util.parseBindingExpression(enabled);
        root.extra.init.enabledG = "function(){with(this){return " + result.code + "}}";
        root.extra.init.enabledV = result.vars;
    }
};
