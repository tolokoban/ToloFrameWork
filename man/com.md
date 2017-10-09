# Writing an HTML component

An HTML component is a nodejs module which replace HTML tags at compilation time.
To write a component called `foobar`, for instance, you need at least the following file:
* `src/com/foobar/foobar.com.js`

Here is an example:

``` js
"use strict";

exports.tags = ["^my-mail$"];

exports.compile = function(root, libs) {
  root.name = "a";
  root.attribs = { href: "mailto:foobar@html-components.com" };
}
```



----

[Back](../README.md)
