/**********************************************************************
 @example
 <x-widget name="tfw.input" $value="Email" $validator="[^@]+@[^@]\\.[^@.]+"/>
 <x-widget name="tfw.input" $validator="[^@]+@[^@]\\.[^@.]+">Email</x-widget>
 <wdg:checkbox $value="false" $wide="true" />
 **********************************************************************/

exports.tags = ["x-widget", "wdg:.+"];
exports.priority = 0;

var ID = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var com = {
        // HTML element attributes.
        attr: {},
        // Widget properties.
        prop: {},
        // Widget properties bindings.
        bind: {},
        // Required modules.
        require: [],
        // Temporary variables.
        temp: {}
    };

    parseComponent( root, libs, com );

};


/**
 * @return `{ attr: {id:...}, prop: {value:...}, bind: {enabled:...}, name: "wdg.text", require: []}`
 */
function parseComponent(root, libs, com) {
    getModuleName( root, libs, com );
    getUniqueIdentifier( root, libs, com );
    getRootChildren( root, libs, com );
    getPropertiesAndBindings( root, libs, com );
    parseChilrenProperties( root, libs, com );

    root.children = [];
    root.name = "div";
    delete root.autoclose;
    root.attribs = {
        id: com.attr.id,
        style: "display:none"
    };

    libs.require(com.name);
    libs.require("x-widget");
    libs.addInitJS("var W = require('x-widget');");
    libs.addInitJS(
        "try{W('" + com.attr.id + "','" + com.name + "'," 
            + stringifyProperties(com.prop) + ")"
            + "}\ncatch(x) {console.error('Unable to initialize " + com.name + "!', x)}"
    );
};


function camelCase( text ) {
    return text.split('-').map(function(itm, idx) {
        if (idx == 0) return itm;
        return itm.charAt(0).toUpperCase() + itm.substr(1);
    }).join('');
}


function stringifyProperties( prop ) {
    var first = true;
    var out = '{';
    var key, val;
    for( key in prop ) {
        val = prop[key];
        if (first) {
            first = false;
        } else {
            out += ",";
        }
        out += "\n  " + camelCase(key) + ": " + val;
    }
    return out + '}';
}

/**
 * Module's name of this component.
 * `com == {name: ...}`
 */
function getModuleName(root, libs, com) {
    var name = root.attribs.name;
    if (root.name.substr( 0, 4 ) == 'wdg:' ) {
        name = "wdg." + root.name.substr( 4 );
    } else {
        if (!name || name.length == 0) {
            libs.fatal("[x-widget] Missing attribute \"name\"!");
        }
    }
    com.name = name;
}


/**
 * Unique identifier.
 * `com == {attr: {id:...}}`
 */
function getUniqueIdentifier(root, libs, com) {
    var id = root.attribs.id || (com.name + ID++);
    com.attr.id = id;
}


/**
 * If root has got a `src` attribute, we load a file and put its content as children of `root`.
 */
function getRootChildren(root, libs, com) {
    var src = (root.attribs.src || "").trim();
    if (src.length > 0) {
        if (!libs.fileExists( src )) {
            libs.fatal("File not found: \"" + src + "\"!");
        }
        // Add a compilation dependency on the include file.
        libs.addInclude( src );
        var content = libs.readFileContent( src );
        root.children = libs.parseHTML( content );
    }
}


/**
 * Properties and bindings.
 */
function getPropertiesAndBindings(root, libs, com) {
    // Attributes can have post initialization, especially for data bindings.
    var postInit = {};
    var hasPostInit = false;
    // All the attributes that start with a '$' are used as args attributes.
    var key, val;
    for( key in root.attribs ) {
        if( key.charAt(0) == '$' ) {
            val = root.attribs[key];
            com.prop[key.substr( 1 )] = JSON.stringify(val);
        }
        else if (key.substr( 0, 5 ) == 'bind:') {
            val = root.attribs[key];
            key = key.substr( 5 );
            if( typeof postInit[key] === 'undefined' ) postInit[key] = {};
            val = val.split( ':' );
            if (val.length < 2) val.push('value');
            postInit[key].B = val.map(function(x){return x.trim();});
            hasPostInit = true;
        }
    }

    if (hasPostInit) {
        libs.addPostInitJS(
            "W.bind('" + com.attr.id + "'," + JSON.stringify(postInit) + ");"
        );
    }
}


/**
@example

<wdg:combo $key="fr">
  <content json>
{
  "en": "English",
  "fr": "Français",
  "it": "Italiano"
}
  </content>
</wdg:combo>
 */
function parseChilrenProperties(root, libs, com) {
    root.children.forEach(function (child) {
        if (child.type != libs.Tree.TAG) return;
        console.info("[x-widget.com] child=...", JSON.stringify(child));

        if (child.attribs.json === null) {
            var text = libs.Tree.text( child ).trim();
            try {
                com.prop[child.name] = JSON.stringify(JSON.parse( text ), null, '  ');
            }
            catch (ex) {
                libs.fatal("Unable to parse JSON value of property `" + child.name + "`: "
                          + ex + "\n" + text);
            }
        }
    });
}
