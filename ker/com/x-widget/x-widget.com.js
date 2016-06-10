/**********************************************************************
 @example
 <x-widget name="tfw.input" $value="Email" $validator="[^@]+@[^@]\\.[^@.]+"/>
 <x-widget name="tfw.input" $validator="[^@]+@[^@]\\.[^@.]+">Email</x-widget>
 <wdg:checkbox $value="false" $wide="true" />
 **********************************************************************/

exports.tags = ["x-widget", "wdg:.+"];
exports.priority = 0;

var ID = 0;
// When a widget is child of another widget, we will skip it and parse its content.
var SKIP = false;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    if (SKIP) {
        // For widgets, children of other widgets, we want to compile the properties' children.
        root.children.forEach(function (child) {
            if (child.type == libs.Tree.TAG) {
                libs.compileChildren( child );
            }
        });
        return;
    }

    SKIP = true;
    var com = parseComponent( root, libs, '        ' );

    libs.require("x-widget");
    libs.require(com.name);
    libs.addInitJS("var W = require('x-widget');");
    libs.addInitJS(
        "        W('" + com.attr.id + "', '" + com.name + "', "
            + stringifyProperties(com.prop, '          ') + ")"
    );
    SKIP = false;
};


/**
 * @return `{ attr: {id:...}, prop: {value:...}, bind: {enabled:...}, name: "wdg.text", require: []}`
 */
function parseComponent(root, libs, indent) {
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

    getModuleName( root, libs, com );
    getUniqueIdentifier( root, libs, com );
    getRootChildren( root, libs, com );
    getPropertiesAndBindings( root, libs, com, indent );
    parseChildrenProperties( root, libs, com, indent );

    root.children = [];
    root.name = "div";
    delete root.autoclose;
    root.attribs = {
        id: com.attr.id,
        style: "display:none"
    };

    return com;
};


function camelCase( text ) {
    return text.split('-').map(function(itm, idx) {
        if (idx == 0) return itm;
        return itm.charAt(0).toUpperCase() + itm.substr(1);
    }).join('');
}


function stringifyProperties( prop, indent ) {
    var count = 0;
    var key, val;
    var out;

    // We want to know if there is more than one item.
    for( key in prop ) {
        count++;
        if (count > 1) break;
    }

    if (count == 0) return "{}";
    else if (count == 1) {
        for( key in prop ) {
            return "{" + JSON.stringify( key ) + ": " + prop[key] + "}";
        }
    }
    else {
        var first = true;
        out = '{';
        for( key in prop ) {
            val = prop[key];
            if (first) {
                first = false;
            } else {
                out += ",";
            }
            out += "\n  " + indent + camelCase(key) + ": " + val;
        }
        return out + '}';
    }
}


/**
 * @param {array} arr - Array of strings.
 *
 * If `arr` has more than one element, it will be displayed on several lines.
 */
function stringifyArray( arr, indent ) {
    var hasMoreThanOneItem = arr.length > 1;
    if (hasMoreThanOneItem) {
        var out = '[';
        arr.forEach(function (itm, idx) {
            if (idx > 0) out += ",";
            out += "\n" + indent + itm;
        });
        return out + "]";
    } else {
        return "[" + (arr.length == 1 ? arr[0] : '') + "]";
    }
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
            libs.fatal("[x-widget] Missing attribute \"name\"!", root);
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
function getPropertiesAndBindings(root, libs, com, indent) {
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
            "        W.bind('" + com.attr.id + "'," + JSON.stringify(postInit) + ");"
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
function parseChildrenProperties(root, libs, com, indent) {
    root.children.forEach(function (child) {
        if (child.type != libs.Tree.TAG) return;
        libs.compileChildren( child );

        if (child.attribs.json === null) parsePropertyJSON(child, libs, com);
        else if (child.attribs.list === null) parsePropertyList(child, libs, com, indent + "  ");
    });
}


function parsePropertyJSON(root, libs, com) {
    var text = libs.Tree.text( root ).trim();
    try {
        com.prop[root.name] = JSON.stringify(JSON.parse( text ), null, '  ');
    }
    catch (ex) {
        libs.fatal("Unable to parse JSON value of property `" + root.name + "`: "
                   + ex + "\n" + text);
    }
}


/**
 @example

 <wdg:layout-line>
 <content list>
 <div>
 J'aime bien les <b>crevettes</b>. Pas vous ?
 </div>
 <wdg:button $text="Yes" />
 <wdg:button $text="Nein !" />
 </content>
 </wdg:layout-line>
 */
function parsePropertyList(root, libs, com, indent) {
    var first = true;
    var out = '[';
    root.children.forEach(function (child) {
        if (child.type != libs.Tree.TAG) return;
        if (first) {
            first = false;
        } else {
            out += ",";
        }
        out += "\n" + indent;
        if (isWidget( child )) {
            out += parseWidget( child, libs, com, indent + '  ' );
        } else {
            out += parseElement( child, libs, com, indent + '  ' );
        }
    });

    out += ']';
    com.prop[root.name] = out;
}


function parseElement(root, libs, com, indent) {
    var out = "W({\n" + indent + "  elem: " + JSON.stringify(root.name);
    var attr = {}, hasAttributes = false;
    var prop = {}, hasProperties = false;
    var attKey, attVal;
    for( attKey in root.attribs ) {
        attVal = root.attribs[attKey];
        if (attKey.charAt(0) == '$') {
            hasProperties = true;
            prop[attKey.substr( 1 )] = JSON.stringify( attVal );
        } else {
            hasAttributes = true;
            attr[attKey] = JSON.stringify( attVal );
        }
    };
    if (hasAttributes) {
        out += ",\n" + indent + "  attr: " + stringifyProperties( attr, indent + '  ' );
    }
    if (hasProperties) {
        out += ",\n" + indent + "  prop: " + stringifyProperties( prop, indent + '  ' );
    }
    var children = [];
    root.children.forEach(function (child) {
        if (child.type == libs.Tree.TEXT) {
            children.push(JSON.stringify( child.text ));
        }
        else if (child.type == libs.Tree.TAG) {
            children.push( parseElement( child, libs, com, indent + '    ' ) );
        }
    });
    if (children.length > 0) {
        out += ",\n" + indent + "  children: " + stringifyArray(children, indent + '    ');
    }

    return out + "})";
}


function parseWidget(root, libs, parent, indent) {
    var com = parseComponent( root, libs, indent );
    libs.require(com.name);
    return indent + "W('" + com.attr.id + "', '" + com.name + "', "
        + stringifyProperties(com.prop, indent) + ")";
}


function isWidget( root ) {
    var name = root.name;
    if (name.substr(0, 4) == 'wdg:' || name == 'x-widget') {
        console.log(name + " is a WIDGET!");
        return true;
    }
    return false;
}
