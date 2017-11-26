/**
 * Component page
 */

exports.tags = ["page"];
exports.priority = 0;

/**
 * Compile a node of the HTML tree.
 */
exports.compile = function(root, libs) {
    root.name = 'x-html';
    var children = [
        {
            type: libs.Tree.TAG, name: 'head', children: [
                {
                    type: libs.Tree.TAG, name: 'link', attribs: {
                        href: "https://fonts.googleapis.com/css?family=Josefin+Sans",
                        rel: "stylesheet",
                        type: "text/css"
                    }
                }
            ]
        },
        {
            type: libs.Tree.TAG, name: 'body', attribs: {'class': 'theme-webgl theme-color-bg-B5'},
            children: [
                {
                    type: libs.Tree.TAG, name: 'section',
                    attribs: {'class': 'theme-color-bg-B0 theme-elevation-4'},
                    children: [
                        { type: libs.Tree.TAG, name: 'x-md', children: root.children }
                    ]
                }
            ]
        }
    ];
    root.children = children;
    libs.compile( root );
};
