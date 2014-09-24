ToloFrameWork
=============

Organisation of the source folder
---------------------------------

* `project.tfw.json`: project's configuration file.
* `doc/`: auto-generated documentation.
* `src/`: HTML source files.
  * `src/cls/`: javascript classes.
  * `src/wdg/`: widgets' folder.
* `tmp/`: files used by the compiler to link the project.
* `www/`: resulting project.


Compilation process step by step
--------------------------------

For each HTML file (extension `*.html`) in the directory `src/`, __TFW__ will create an HTML file with the same name in the resulting directory `www/`. Here is what the compiler do for one HTML file.

<h3>Inner styles and javascripts</h3>

We want all the javascript and CSS outside the HTML file. First for clarity reason and also besauce Firefox OS doesn't grant web apps if the javascript is not externalized in a separate file.

We put scripts code into the tag __`innerJS`__ and CSS code into __`innerCSS`__.

<h3>Outer styles and javascripts</h3>

We look for this kind of tags:
``` xml
<link href="mystyle.css" rel="stylesheet" type="text/css" />
<script src="myscript.js"></script>
```
The tag __`outerJS`__ will be an array of javascript files relative to the HTML file, and __`outerCSS`__ an array of CSS files.

<h3>Widgets</h3>

All elements with the namespace `w:` are widgets. If the HTML file contains, for instance, the widgets `<w:foo>` and `<w:bar>`, we put `["wdg/foo/compile-foo.js", "wdg/bar/compile-bar.js"]` into the tag __`dependencies`__.
