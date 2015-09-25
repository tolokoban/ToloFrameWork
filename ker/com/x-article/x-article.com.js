/**
 * Component x-article
 */

exports.tags = ["x-article"];
exports.priority = 0;

/**
 * Called the  first time the  component is  used in the  complete build
 * process.
 */
exports.initialize = function(libs) {};

/**
 * Called the first time the component is used in a specific HTML file.
 */
exports.open = function(file, libs) {};

/**
 * Called after a specific HTML file  as been processed. And called only
 * if the component has been used in this HTML file.
 */
exports.close = function(file, libs) {};

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    var N = libs.Tree,
    result = [],
    head = null,
    title = libs.getVar("$title"),
    app,
    refs = {},
    links = [],
    pageIndex = 0;
    N.forEachAttrib(root, function (attName, attValue) {
        if (attName.toLowerCase() == 'title') {
            title = attValue;
        }
        else if (attName.toLowerCase() == 'app' && attValue.length > 0) {
            app = attValue;
        }
    });
    
    N.forEachChild(root, function (child) {
        if (child.type != N.TAG) return;
        var name = child.name.toLowerCase();
        if (name == 'head') {
            head = child;
        }
        else if (name == 'page') {
            child.name = 'x-html';
            if (typeof child.attribs.title === 'undefined') child.attribs.title = title;
            if (typeof child.attribs.app === 'undefined') child.attribs.app = app;
            if (head) {
                child.children.push(head);
            }
            libs.compile(child);
            N.walk(child, function(node) {
                if (node.type == N.TAG && node.name.toLowerCase() == 'a') {
                    node.page = pageIndex;
                    if (node.attribs.name) {
                        refs[node.attribs.name] = pageIndex;
                    }
                    if (node.attribs.href && node.attribs.href.charAt(0) == '#') {
                        links.push(node);
                    }
                }
            });
            pageIndex++;
            result.push(child);
        }        
    });
    links.forEach(function (link) {
        var href = link.attribs.href.substr(1);
        var ref = refs[href];
        if (typeof ref === 'undefined') {
            libs.fatal("Reference not found: \"" + href + "\"!\n" + N.toString(link));
        }
        if (link.page != ref) {
            var filename = libs.getVar('$filename');
            if (ref > 0) {
                filename = filename.substr(0, filename.length - 4) + ref + '.html';
            }
            link.attribs.href = filename + '#' + href;
        }
    });

    root.type = N.PAGES;
    delete root.name;
    delete root.attribs;
    root.children = result;
};
