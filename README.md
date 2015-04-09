# ToloFrameWork

Framework for fast Firefox OS and Node-Webkit apps development with better collaboration between designer and hacker.

## project.tfw.json

This is your project configuration file. Here is an example:

```
{
    "name": "My project",
    "version": "0.0.1",
    "type": "nodewebkit",
    "html-filter": ["\\.html$", "^htm$/.+/\\.html$"]
}
```

* __name__ (_string_): name of your project.
* __version__ (_string_): three numbers version number autoincremented at every build. If you put less than tree numbers, as many `.0` as needed will be appended.
* __type__ (_string_): can be `firefoxos` or `nodewebkit`. Default is `firefoxos`.
* __html-filter__ (_string_ or _array_): filter or list of filters of html pages to be built. Files are searched from the `src/` directory. Each filter is made of regular expressions separated with `/`. Hence, `^a/\\.html$` means every file with `.html` as extension and which lies in a directory whose name starts with `a`.


## Build time widgets

The HTML pages can contain widget tags. There are tags with `w:` as a fake namespace.
For example, the following code uses the widget `w:md` which convert MarkDown to HTML at build time.

```
<w:md>
# My title

Here is my __todo__ list:
* One
* Two
* Three
</w:md>
```


