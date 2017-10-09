# HTML tree manipulation

In the main function of an HTML component,

``` js
exports.compile = function( root, libs ) { }
```

the argument `root` is a object (without methods) mapping to an HTML tag.
The available attributes are:
* `type`: One of the constants defined in `libs.Tree`.
* `name`: the name of the element if this node is a __TAG__.
* `attribs`: an object of all the element attributes, if this node is a __TAG__.
* `text`: the content of the text element if this node is a __TEXT__.
* `children`: an array of the children nodes (__TAG__, __VOID__, __PAGES__).

## The library

`libs.Tree` is the library you should use to manipulate such nodes.
It exports what follow:

* __VOID__: this is a fake node, it will just aggregate nodes in the `children` attribute.
* __TAG__, __ELEMENT__: an element of the DOM.
* __TEXT__: a text without any tag arround it.
* __CDATA__: a CDATA element for verbatim text.
* __PROCESSING__: something like `<?xml-stylesheet href="default.css" title="Default style"?>`.
* __COMMENT__: an HTML comment.
* __ENTITY__: an HTML entity, for example: `&amp;`, `&lt;`, ...
* __VERBATIM__: a chunk of unparsed HTML code. It will be flushed as is in the output.
* __PAGES__: every children is a diffrent HTML file. Usefull to generate several pages.

* `toString( node )`: stringify a `node` into a correct HTML code.
