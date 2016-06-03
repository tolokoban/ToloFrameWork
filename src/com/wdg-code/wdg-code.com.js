/**********************************************************************
 @example
 <x-widget name="tfw.input" $value="Email" $validator="[^@]+@[^@]\\.[^@.]+"/>
 <x-widget name="tfw.input" $validator="[^@]+@[^@]\\.[^@.]+">Email</x-widget>

 **********************************************************************/

exports.tags = ["wdg-code"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var name = root.attribs.$name;
    delete root.attribs.$name;
    
    var attribs = {};
    var attKey, attVal, attValue, attBind;
    var pre = '<pre>\n&lt;';
    var wdg = "<";
    var wdgID = '';
    if (name.substr(0, 4) == 'wdg.') {
        pre += "wdg:" + name.substr( 4 );
        wdg += "wdg:" + name.substr( 4 );
    } else {
        pre += "x-widget name=\"" + name + "\"";
        wdg += "x-widget name=\"" + name + "\"";
    }
    if (typeof root.attribs.id !== 'undefined') {
        wdgID = " id=\"" + root.attribs.id + "\"";
        delete root.attribs.id;
    }

    for( attKey in root.attribs ) {
        attVal = root.attribs[attKey];
        attVal = attVal.split(' / ');
        attValue = attVal[0].trim();
        wdg += "\n   $" + attKey + "=\"" + attValue + "\"";
        pre += "\n   <span title=\""
            + attKey + " = " + attValue + "\"><b>"
            + attKey + "</b>=\"<span style='color:blue'>";
        if (attVal.length > 1) {
            attBind = attVal[1].trim();
            pre += "<wdg:label bind:value=\"" + attBind + "\" $value=\""
            + attValue + "\"/>";
            wdg += " bind:" + attKey + "=\"" + attBind + "\"";
        } else {
            pre += attValue;
        }
        pre += "</span>\"</span>";
    }
    pre += " />\n</pre>\n";

    wdg = "<div class='light'>\n" + wdg + wdgID + " />\n</div>\n"
        + "<div class='dark'>\n" + wdg + " />\n</div>\n";
//console.log(pre);
//console.log(wdg);

    pre = libs.parseHTML( pre );
    libs.compile( pre );
    wdg = libs.parseHTML( wdg );
    libs.compile( wdg );
    root.name = "div";
    root.attribs = {"class": "wdg-code"};
    var content = root.children;
    root.children = [pre, wdg];
    if (content.length > 0) {
        root.children.push( {type: libs.Tree.TAG, name: 'hr'} );
    }
    content.forEach(function (child) {
        libs.compile( child );
        root.children.push( child );
    });
};
