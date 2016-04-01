/**********************************************************************
 require( 'x-central-box.com' )
 -----------------------------------------------------------------------
 
 **********************************************************************/

exports.tags = ["x-central-box"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var id = root.attribs.id || libs.nextID();
    if( typeof root.attribs.class === 'undefined' ) root.attribs.class = 'x-central-box';
    else root.attribs.class += ' x-central-box';
    root.attribs.id = id;
    checkDefaults( root.attribs );

    root.name = "div";
    var style = "#" + id + "{\n"
            + "  position: absolute;\n"
            + "  left: 50%;\n"
            + "  top: 50%;\n"
            + "  width: " + root.attribs.width + "px;\n"
            + "  height: " + root.attribs.height + "px;\n"
            + "  margin: -" + Math.floor( .5 + root.attribs.height / 2 ) + "px "
            + "-" + Math.floor( .5 + root.attribs.width / 2 ) + "px;\n"
            + "  background: #fff;\n"
            + "  padding: .5rem;\n"
            + "  overflow: " + (typeof root.attribs.scroll === 'undefined' ? 'hidden' : 'auto') + ";\n"
            + "}";
    var media = "  #" + id + " {\n"
            + "    left: 0;\n"
            + "    top: 0;\n"
            + "    margin: 0;\n"
            + "    width: 100%;\n"
            + "    height: 100%;\n"
            + "    border-radius: 0;\n"
            + "    border: none;\n"
            + "    box-shadow: none;\n"
            + "  }\n"
            + "  html {\n"
            + "    font-size: " + (100 / root.attribs.cols) + "vw;\n"
            + "  }\n";
    style += "@media (max-width: " + root.attribs.width + "px) {\n" + media + "}\n";
    style += "@media (max-height: " + root.attribs.height + "px) {\n" + media + "}\n";
    delete root.attribs.width;
    delete root.attribs.height;
    libs.compileChildren( root );
    libs.addInnerCSS( style );
};


function checkDefaults( attribs ) {
    var defaults = {
        width: 240,
        height: 320,
        cols: 25
    };
    var key, val, num;
    for( key in defaults ) {
        val = defaults[key];
        num = parseInt( attribs[key] );
        if( typeof num === 'undefined' || isNaN( num ) ) {
            attribs[key] = val;
        }
    }
}
