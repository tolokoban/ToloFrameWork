/**********************************************************************
 @example
 <x-widget name="tfw.input" $value="Email" $validator="[^@]+@[^@]\\.[^@.]+"/>
 <x-widget name="tfw.input" $validator="[^@]+@[^@]\\.[^@.]+">Email</x-widget>

 **********************************************************************/

exports.tags = ["x-widget", "wdg:.+"];
exports.priority = 0;

var ID = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var name = root.attribs.name;
    if (root.name.substr( 0, 4 ) == 'wdg:' ) {
        name = "wdg." + root.name.substr( 4 );
    } else {
        if (!name || name.length == 0) {
            libs.fatal("[x-widget] Missing attribute \"name\"!");
        }
    }
    var id = root.attribs.id || (name + ID++);
    var src = (root.attribs.src || "").trim();
    var args = null;
    if (src.length > 0) {
        if (!libs.fileExists(src)) {
            libs.fatal("File not found: \"" + src + "\"!");
        }
        libs.addInclude(src);
        args = libs.readFileContent(src);
    }
    if (!args) {
        args = libs.Tree.text(root).trim();
    }
    if (args.charAt(0) != '{' && args.charAt(0) != '[') {
        try {
            args = JSON.parse(args);
        }
        catch (ex) {
            // This is a string.
            args = JSON.stringify(args);
        }
    }
    // Attributes can have post initialization, especially for data bindings.
    var postInit = {};
    var hasPostInit = false;
    if( args == '""' ) {
        // All the attributes that start with a '$' are used as args attributes.
        args = {};
        var key, val;
        for( key in root.attribs ) {
            if( key.charAt(0) == '$' ) {
                val = root.attribs[key];
                args[key.substr( 1 )] = val;
            }
            else if (key.substr( 0, 5 ) == 'bind:') {
                val = root.attribs[key];
                key = key.substr( 5 );
                if( typeof postInit[key] === 'undefined' ) postInit[key] = {};
                val = val.split( ':' );
                if (val.length < 2) val.push('value');
                postInit[key].B = val.map(function(itm){ return itm.trim(); });
                hasPostInit = true;
            }
        }
        args = JSON.stringify( args );
    }

    root.children = [];
    root.name = "div";
    delete root.autoclose;
    root.attribs = {
        id: id,
        style: "display:none"
    };

    libs.require(name);
    libs.require("x-widget");
    libs.addInitJS("var W = require('x-widget');");
    libs.addInitJS(
        "try{"
            + "W('" + id + "','" + name + "'," + args + ")"
            + "}catch(x){console.error('Unable to initialize " + name + "!', x)}"
    );
    if (hasPostInit) {
        libs.addPostInitJS(
            "W.bind('" + id + "'," + JSON.stringify(postInit) + ");"
        );
    }
};
