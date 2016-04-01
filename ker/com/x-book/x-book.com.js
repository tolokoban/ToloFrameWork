/**********************************************************************
 require( 'x-book.com' )
 -----------------------------------------------------------------------
 @example
<x-book>
  <login>

  </login>

  <tasks-list>

  </tasks-list>

  <tasks-add>

  </tasks-add>
</x-book>
 **********************************************************************/


exports.tags = ["x-book"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    libs.require("tfw.wdg.book");
    var id = root.attribs.id || libs.nextID();
    var children = [];
    // Loop on each page definition.
    root.children.forEach(function (child) {
        if (child.type != libs.Tree.TAG) return;
        child.attribs["data-page"] = child.name;
        child.name = "div";
        children.push(child);
        libs.compile(child);
    });
    root.children = children;
    root.name = "div";
    root.attribs.id = id;
    if( root.attribs.scroll ) {
        libs.addInnerCSS(
            "#" + id + " { overflow: auto; }\n"
        );
        delete root.attribs.scroll;
    }
    var args = "'" + id + "'";
    if (root.attribs.hash) {
        args += ", " + JSON.stringify(root.attribs.hash);
    }
    libs.addInitJS("require('tfw.wdg.book').create(" + args + ");");
};
