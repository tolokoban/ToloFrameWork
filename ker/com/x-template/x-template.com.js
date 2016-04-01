/****************************************
Component x-template

```
<x-template mod="test.contact">
  <fieldset>
    <legend $tpl="title">Contact</legend>
    <dl>
      <dt>Name:</dt>
      <dd>
        <input type="text" $tpl="name">
      </dd>
    </dl>
    <dl>
      <dt>E-Mail:</dt>
      <dd>
        <input type="text" $tpl="email">
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
    var name = root.attribs.name;
    if( typeof name === 'undefined' ) {
        libs.fatal("[x-template] Missing mandatory attribute `name`!");
    }
    var componentName = getComponentName( name );

    var output = "/****************************************\n"
            + libs.Tree.toString( root, '  ' )
            + "\n****************************************/\n"
            + "require('x-template').register(" + JSON.stringify( name ) + ", function( root ) {\n"
            + "    var $ = require( 'dom' );\n";

    // Counter is used to name the children elements.
    var counter = {value: 1};
    // Each time we  find `$tpl="toto"`, we will add the  element as a
    // value of the key `toto` of `ids`.
    var ids = {};
    // Javascript code for template creation using the DOM.
    var code = parseChildren( libs, 'root', counter, root.children, ids );

    output += code + getReturnCode( ids ) + "});\n";
    //console.log( output );
    libs.addInitJS( output );
    libs.require( "x-template" );
    
    root.type = libs.Tree.VOID;
    root.children = [];
};


function getReturnCode( ids ) {
    var code = "    return { ";
    var key, val, first = true;
    for( key in ids ) {
        val = ids[key];
        if( first ) first = false;
        else code += ", ";
        code += JSON.stringify( key ) + ": " + val;
    }

    return code += " };\n";
}

/**
 * @param parent {string} - name of the varible representing the parent to which append new elements.
 */
function parseChildren( libs, parent, counter, children, ids ) {
    var Tree = libs.Tree;
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
                prefix += "$.txt( " + JSON.stringify( child.text ) +" );\n";
            } else {
                // Ignoring this child because it is an empty text node.
                return;
            }
            break;
        case Tree.TAG:
            if( child.name == 'div' ) {
                prefix += "$.div(";
                if( typeof child.attribs['class'] === 'string' ) {
                    prefix += " " + JSON.stringify( child.attribs.class ) + " ";
                    delete child.attribs.class;
                }
                prefix += ");\n";
            } else if( child.name == 'x-widget' ) {
                libs.require( "x-widget" );
                prefix += "require('x-widget').template(" + JSON.stringify( child.attribs ) + ");\n";
            } else {
                prefix += "$.tag( " + JSON.stringify(child.name);
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
                if( keyNS.id == '$tpl' ) {
                    ids[val] = name;
                } else {
                    hasAttribs = true;
                    attribs[keyNS.id] = val;
                }
            }
        }
        if( hasAttribs && child.name != 'x-widget' ) {
            code += indent + "$.att( " + name + ", "
                + JSON.stringify( attribs ) + " );\n";
        }

        if( parent ) {
            // Attach to the parent.
            code += indent + parent + ".appendChild( " + name + " );\n";
        }

        // Look recursively for children.
        if( Array.isArray( child.children ) ) {
            code += parseChildren( libs, name, counter, child.children, ids );
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
