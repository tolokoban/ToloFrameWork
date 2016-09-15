/**********************************************************************
 *  Trois syntaxes possibles :
 *  * `<wdg:label ...>` : instancie la classe `wdg.label`.
 *  * `<x-widget name="label" ...>` : instancie la classe `label`.
 *  * `<x-wdg name="label" ...>` : instancie la classe `label` (juste un alias de la syntaxe précédente).
 * 
 * Pour spécifier les propriétés d'un objet, il existe deux possibilités.
 * 
 * * Forme __inline__ : `<wdg:button $text="Cancel"/>`.
 *   * Il est possible d'utiliser l'internationalisation :
 *     `<wdg:button intl:text="cancel-caption"/>`
 *   * On peut lier la valeur à celle de la propriété d'un autre objet :
 *     * Lier à l'attribut 'bar' de l'objet dont l'ID est 'foo' :
 *       `<wdg:button bind:text="foo:bar"/>`
 *     * Quand on ne spécifie pas le nom de la propriété, c'est `value` qui est utilisée :
 *       `<wdg:button bind:text="foo"/>`
 *     * Pour lier à plusieurs sources, on utilise la virgule :
 *       `<wdg:button bind:text="foo1, foo2, foo3"/>`
 *     * Pour spécifier une valeur, on utilise le `=` :
 *       `<wdg:button bind:text="action='ok'"/>`
 * * Forme __expanded__ : `<wdg:button><text>Cancel</text></wdg:button>`.
 *   Il arrive qu'on doive utiliser des valeurs dont le type n'est pas une string.
 *   Dans ce cas, on met dans le body des tags dont le nom est celui de la propriété.
 *   Ces tags peuvent avoir des attributs qui spécifient le type.
 *   Par exemple :
 *   ```
 *   <wdg:combo $key="fr">
 *     <content json>
 *       {
 *         "en": "English",
 *         "fr": "Français",
 *         "it": "Italiano"
 *       }
 *     </content>
 *   </wdg:combo>
 *   ```
 *    * __json__ : le contenu textuel doit être parsé comme du JSON.
 * 
 * 
 *  @example
 *  <x-widget name="tfw.input" $value="Email" $validator="[^@]+@[^@]\\.[^@.]+"/>
 *  <x-widget name="tfw.input" $validator="[^@]+@[^@]\\.[^@.]+">Email</x-widget>
 *  <wdg:checkbox $value="false" $wide="true" />
 *  <wdg:label intl:value="title-text" $wide="true" />
 **********************************************************************/

exports.tags = ["x-widget", "x-wdg", "wdg:.+"];
exports.priority = 0;

String.trim = function(x) { return x.trim(); };


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
    var key, val, values;
    var bindings;
    var slots;
    for( key in root.attribs ) {
        if( key.charAt(0) == '$' ) {
            val = root.attribs[key];
            com.prop[key.substr( 1 )] = JSON.stringify(val);
        }
        else if (key.substr( 0, 5 ) == 'intl:') {
            // Internationalization.
            val = root.attribs[key];
            com.prop[key.substr( 5 )] = "APP._(" + JSON.stringify(val) + ")";
        }
        else if (key.substr( 0, 5 ) == 'bind:') {
            // Syntaxe :
            // <bind> := <bind-item> <bind-next>*
            // <bind-next> := "," <bind-item>
            // <bind-item> := <widget-name> <attribute>? <value>?
            // <widget-name> := /[$a-zA-Z_-][$0-9a-zA-Z_-]+/
            // <attribute> := ":" <attrib-name>
            // <attrib-name> := /[$a-zA-Z_-][$0-9a-zA-Z_-]+/
            // <value> := "=" <data>
            // <data> := "true" | "false" | "null" | <number> | <string>
            //
            // @example
            // <wdg:checkbox bind:value="btn1:action" />
            // <wdg:checkbox bind:value="btn1:action, btn2, action=false" />
            if( typeof postInit[key.substr(5)] === 'undefined' ) postInit[key.substr(5)] = {};
            postInit[key.substr(5)].B = parseBinding(root.attribs[key]);
            hasPostInit = true;
        }
        else if (key.substr( 0, 5 ) == 'slot:') {
            // @example
            // <wdg:button slot:action="removeOrder" />
            // <wdg:button slot:action="removeOrder, changePage" />
            // <wdg:button slot:action="my-module:my-function" />
            values = root.attribs[key].split(",");
            key = key.substr( 5 );
            if( typeof postInit[key] === 'undefined' ) postInit[key] = {};
            slots = [];
            values.forEach(function (val) {
                // Before the colon (:) there is the module name.
                // After, there is the function name.
                // If there is no colon, `APP` is used as module.
                val = val.split( ':' );
                if (val.length < 2) {
                    slots.push( val[0].trim() );
                } else {
                    slots.push( val.map(String.trim) );
                    libs.require( val[0] );
                }
            });
            postInit[key].S = slots;
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
        // By default, this is a list.
        else parsePropertyList(child, libs, com, indent + "  ");
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
 *  @example
 * 
 *  <wdg:layout-line>
 *    <content list>
 *      <div>
 *        J'aime bien les <b>crevettes</b>. Pas vous ?
 *      </div>
 *      <wdg:button $text="Yes" />
 *      <wdg:button $text="Nein !" />
 *    </content>
 *  </wdg:layout-line>
 */
function parsePropertyList(root, libs, com, indent) {
    var first = true;
    var out = '[';
    libs.compileChildren( root );
    root.children.forEach(function (child) {
        if (child.type != libs.Tree.TAG) {
            return;
        }
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
            if (isWidget( child )) {
                children.push( parseWidget( child, libs, com, indent + '    ' ) );
            } else {
                children.push( parseElement( child, libs, com, indent + '    ' ) );
            }
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
        return true;
    }
    return false;
}


var parseBinding = (
    function() {
        var Lexer = require('tlk-lexer');

        var lexer = new Lexer({
            value: "(-?(\.[0-9]+|[0-9]+(\.[0-9]+)?))|true|false|null|('(\\.|[^\\']+)*')",
            comma: "[ \t\n\r]*,[ \t\n\r]*",
            colon: "[ \t\n\r]*:[ \t\n\r]*",
            equal: "[ \t\n\r]*=[ \t\n\r]*",
            name: "[$a-zA-Z_-][$a-zA-Z_0-9-]+"
        });

        /**
         * Syntaxe :
         * <bind> := <bind-item> <bind-next>*
         * <bind-next> := "," <bind-item>
         * <bind-item> := <widget-name> <attribute>? <value>?
         * <widget-name> := /[$a-zA-Z_-][$0-9a-zA-Z_-]+/
         * <attribute> := ":" <attrib-name>
         * <attrib-name> := /[$a-zA-Z_-][$0-9a-zA-Z_-]+/
         * <value> := "=" <data>
         * <data> := "true" | "false" | "null" | <number> | <string>
         */
        return function( code ) {
            console.info("[x-widget.com] code=...", code);
            code = code.trim();
            lexer.loadText( code );
            var tkn, widget, attribute = 'action', value, bindings = [];

            function addBinding() {
                if (typeof widget === 'string') {
                    var binding = [widget, attribute];
                    if (typeof value !== 'undefined') {
                        binding.push( value );
                    }
                    bindings.push( binding );
                    widget = undefined;
                    attribute = 'action';
                    value = undefined;
                }
            }

            while (true) {
                tkn = lexer.next();
                if (null === tkn) break;
                if (tkn.id != 'name') throw Error("Expected `name`, but found `" + tkn.id + "`!`");
                widget = lexer.text( tkn );

                tkn = lexer.next();
                if (null === tkn) break;
                if (tkn.id == 'colon') {
                    tkn = lexer.next();
                    if (null === tkn) throw Error("Missing `name` after `:`!`");
                    if (tkn.id != 'name') throw Error("Expected `name` after `:`, but found `"
                                                      + tkn.id + "`!`");
                    attribute = lexer.text( tkn );
                    tkn = lexer.next();
                    if (null === tkn) break;
                }
                if (tkn.id == 'equal') {
                    tkn = lexer.next();
                    if (null === tkn) throw Error("Missing `value` after `=`!`");
                    if (tkn.id != 'value') throw Error("Expected `value` after `=`, but found `"
                                                       + tkn.id + "`!`");
                    value = lexer.text( tkn );
                    tkn = lexer.next();
                    if (null === tkn) break;
                }
                if (tkn.id != 'comma')throw Error("Expected `comma`, but found `" + tkn.id + "`!`");
                addBinding();
            }
            addBinding();
//console.info("[x-widget.com] bindings=...", bindings);            
            return bindings;
        };
    }
)();
