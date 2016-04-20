/**********************************************************************
 require( 'x-include.com' )
 -----------------------------------------------------------------------
 @example
 <x-include src="portion.htm" />
 **********************************************************************/

exports.tags = ["x-include"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var src = root.attribs.src;
    if( !src ) {
        libs.fatal( "Missing mandatory attribute: `src`!" );
    }
    if( !libs.fileExists( src ) ) {
        libs.fatal( "File not found: \"" + src + "\"!" );
    }
    libs.addInclude( src );
    console.log( "Inlucde HTML: ", src );
    var node = libs.parseHTML(
        libs.readFileContent( src )
    );
    libs.compile( node );
    root.children = node.children;
    root.type = libs.Tree.VOID;
    delete root.attribs;
};
