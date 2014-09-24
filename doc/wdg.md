Widgets
=======

Widgets extend HTML tags using namespace "`w:`".
Most of the time, widgets are expanded at compilation time.

How widgets are compiled
------------------------

The HTML parser walk into the HTML tree in a _bottom-up_ manner, looking for deepest elements first. If an element's name has the namespace `w:`, it is a **widget** and the parser must compile it.

Suppose the element has the name `w:foo`. The parser will look for the sub-directory `wdg/foo/` in the project's root folder. If it doesn't find it there, it looks in the ToloFrameWork root folder.
That means that you can override any widget in your project.

**If the directory is not found anyway, the parser will complain for an unknown widget!**

The element is automatically changed in a `<div>`, if it has got no `id` an incremental one is given to it and two classes are added to it: `custom` and `wtag-foo`. So if there is no other transformation, we will get `<w:foo>bar</w:foo>` transformed in `<div id="47" class="custom wtag-foo">bar</div>`.

<h3>Controller</h3>

If the parser find a class with name `cls/wtag.Foo.js`, it will be used as a controller. Such a class must extend the base class `WTag`.  
The widget `<w:foo>bar</w:foo>` will be transformed in:
```
<div id="47" class="custom wtag-foo">bar</div>
```
with this initialisation code:
```
$$("wtag.Foo", {id: 47});
```

<h3>Style customization</h3>

You can customize the CSS style of any widget by adding files with name `foo-*.css` in the `wdg/foo/` directory. This is made easy by a proper use of the class `custom`.

Suppose your widget has already the following CSS applied to it:
```css
.wtag-foo {
  background: red;
}
```

If you want to be sure that your customized CSS will override the red background, you should write it like this:
```css
.custom.wtag-foo {
  background: green;
}
```



<h3>Advanced transformation</h3>

If there is a file `compile-foo.js` in that directory, it must be a module exporting a function like this one:
```
exports.compile = function(root) {
  root.name = 'button';
}
```
The parser will call this module to transform the element.

The `root` argument has this structure:
* __type__: By default `Tree.TAG`.
* __name__: Tag name (i.e.: div, a, button, ...).
* __attribs__: Dictionary of element's attributes.
* __children__: Children elements of this element.
* __extra__: An object with this structure
  * __controller__: Name of the class (extending `WTag`) used as a controller for this element.
                    By default, and if such a file exists, it is equal
                    to   the  concatenation   of   `wtag.`  with   the
                    capitalized  name  of  the  widget  and  with  the
                    extension `.js`. For example: `wtag.Foo.js`.
  * __init__: Dictionary of attributes for controller initialization.
              By default it contains the element's `id`.
  * __css__: CSS code to add. You can use LESS syntax.
  * __dependencies__: array of files we depend on. Useful for includes.


