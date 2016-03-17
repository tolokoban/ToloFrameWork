/****************************************
Component x-template

```
    <x-template mod="test.contact" tag="section">
        <fieldset>
            <legend>Contact</legend>
            <dl>
                <dt>Name:</dt>
                <dd>
                    <input type="text" tpl-att:value="name">
                </dd>
            </dl>
            <dl>
                <dt>E-Mail:</dt>
                <dd>
                    <input type="text" tpl-att:value="email" tpl-remove-class:invalid="email_valid">
                </dd>
            </dl>
        </fieldset>
    </x-template>
```


****************************************/

exports.tags = ["x-template"];

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    // Name of the module created by this template.
    var mod = root.attribs.mod;
    if( typeof mod === 'undefined' ) {
        libs.fatal("[x-template] Missing mandatory attribute `mod`!");
    }
    delete root.attribs.mod;
    if( typeof root.attribs.tag !== 'undefined' ) {
        root.name = root.attribs.tag;
        delete root.attribs.tag;
    } else {
        root.name = 'div';
    }
    if( typeof root.attribs.class === 'undefined' ) {
        root.attribs.class = mod.replace( /[^a-zA-Z0-9_$]/g, '-');
    }

    var output = "/****************************************\n"
            + libs.Tree.toString( root, '  ' )
            + "\n****************************************/\n\n";
    
    // Counter is used to name the children elements.
    var counter = {value: 0};
    // Javascript code for template creation using the DOM.
    var code = parseChildren( libs.Tree, 'this.element', counter, [root] );

    var componentName = getComponentName( mod );
    output += "var DOM = require( 'dom' );\n\nvar " + componentName + " = function() {\n"
            + code + "};\n\n";


    output += "module.exports = " + componentName + ";\n";
    console.log( output );
    
    root.type = libs.Tree.VOID;    
    root.children = [];
};


/**
 * @param parent {string} - name of the varible representing the parent to which append new elements.
 */
function parseChildren( Tree, parent, counter, children ) {
    var indent = '    ';
    var code = '';
    children.forEach(function ( child ) {
        var name = counter.value == 0 ? 'root' : 'elem' + counter.value;
        // Use `prefix` instead of directly  `code` bevause we want to
        // cancel var assignment in case of empty text nodes.
        var prefix = indent + "var " + name + " = ";
        switch( child.type ) {
        case Tree.TEXT:
            if( child.text.trim().length > 0 ) {
                prefix += "DOM.txt( " + JSON.stringify( child.text ) +" );\n";
            } else {
                // Ignoring this child because it is an empty text node.
                return;
            }
            break;
        case Tree.TAG:
            if( child.name == 'div' ) {
                prefix += "DOM.div(";
                if( typeof child.attribs['class'] === 'string' ) {
                    prefix += " " + JSON.stringify( child.attribs.class ) + " ";
                    delete child.attribs.class;
                }
                prefix += ");\n";
            } else {
                prefix += "DOM.tag( " + JSON.stringify(child.name);
                if( typeof child.attribs['class'] === 'string' ) {
                    prefix += ", " + JSON.stringify( child.attribs.class );
                    delete child.attribs.class;
                }
                prefix += " );\n";
            }            
            break;
        default:
            return;
        }
        code += prefix;
        counter.value++;
        // Attribute `$` is used to prepare code for object properties.
        child.$ = [];
        child.$name = name;
            
        // Deal with attributes.
        var hasAttribs = false;
        var attribs = {};  // Real HTML5 attributes.
        var key, val, keyNS;
        for( key in child.attribs || {} ) {
            val = child.attribs[key];
            keyNS = parseNS( key );
            if( keyNS.ns ) {
                // Spécial template attribute.
                child.$.push({
                    type: keyNS.ns,
                    name: keyNS.id,
                    prop: val
                });
            } else {
                hasAttribs = true;
                attribs[keyNS.id] = val;
            }
        }
        if( hasAttribs ) {
            code += indent + "DOM.att( " + name + ", "
                + JSON.stringify( attribs ) + " );\n";
        }

        // Attach to the parent.
        code += indent + parent + ".appenChild( " + name + " );\n";

        // Look recursively for children.
        if( Array.isArray( child.children ) ) {
            code += parseChildren( Tree, name, counter, child.children );
        }
    });
    return code;
}


/**
 * Extract the namespace of a `name`.
 * @return
 *    `parseNS( "toto" ) === { id: "toto" }`
 *    `parseNS( "tpl-att:value" ) === { ns: "tpl-add", id: "value" }`
 *    `parseNS( "zip:toto:bob" ) === { ns: "zip", id: "toto:bob" }`
 */
function parseNS( name ) {
    var i = name.indexOf( ":" );
    if( i < 0 ) return { id: name };
    return {
        ns: name.substr( 0, i ),
        id: name.substr( i + 1 )
    };
}


/**
 * Transform `toto-bob` into `TotoBob` and `wdg.input` into `Input`.
 */
function getComponentName( name ) {
    // If there are dots, take the string after the last dot.
    name = name.split( '.' ).pop();
    return name.split( '-' ).map( function( item ) {
        return item.charAt( 0 ).toUpperCase() + item.substr( 1 ).toLowerCase();
    }).join( '' );
}
