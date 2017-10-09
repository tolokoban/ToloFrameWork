# Files structure convention

* __package.json__: 
* __src/index.html__: 
* __src/mod/org.home.module.js__: Module javascript code.
* __src/mod/org.home.module.css__: Cascading style sheet.
* __src/mod/org.home.module.ini__: Internationalization.
* __src/mod/org.home.module.dep__: Dependencies.
* __src/mod/org.home.module.wrk__: WebWorker.
* __src/mod/org.home.module/__: CSS resources.

## package.json
Toloframework uses the standard `package.json` file defined by [NPM](https://docs.npmjs.com/getting-started/using-a-package.json), plus the extra section `tfw`.

* `resources` {array}: list of folders to copy verbatim to the output. Default: `[]`.
* `modules` {array}: list of folders containing other modules (must point on `src/`). Default: `[]`.
* `compile`
  * `type` {"fxos"|"nw"}: _firefox OS_ or _[NW.js](https://nwjs.io/)_. Default `"fxos"`.
* `output` {string}: folder where to put the compilation result. Default `"./www"`.
* `consts`. Default `{}`.
  * `all` {object}: attributes to put in the `$` module.
  * `debug` {object}: same thing but for _debug_ mode only.
  * `release` {object}: same thing but for _release_ mode only.

## src/index.html
```html
<x-html app="org.home.module" title="My super App"></x-html>
```

## src/mod/org.home.module.js
A module is an object that can exports its public interface.

See this example.

```js
// File: src/mod/A.js

function tag( name, content ) {
    var e = document.createElement( name );
    e.innerHTML = content;
    return e;
}

exports.div = function( content ) {
  return tag( 'div', content );
};
exports.p = tag.bind( null, 'p' );
```

In __A.js__, `tag()` is private, but `div()` and `p()` are public.
You can use this like in the file `b.js`:
```js
// File: src/mod/A.js

var A = require('A');
document.body.appendChild( A.div( 'Hello world!' );
```

Modules __are singletons__. You can require them as much as you want, they are executed only at first call.

A module can also return a function if you want to:
```js
// File: A.js
module.exports = function( msg  {
  alert( 'ERROR: ' + msg );
};
```

```js
// File: B.js
var A = require('A');
A( 'Huston! We got a problem.' );
```

### NodeWebkit
In NW,js you can require _node.js_ modules. To do this, you have to use the following syntax:
```js
var FS = require('node://fs');
```

## src/mod/org.home.module.css
If this module is used, the CSS is added to `css/@index.css` file.

## src/mod/org.home.module.ini
Example:
```
[en]
hi: Good morning $1!

[fr]
hi: Bien le bonjour $1 !
```

In your module, you have can use the `_()` function like in the following example:
```js
document.body.textContent = _('hi', 'Boss');
```

The `_()` function is also exported, hence you can use it like this:
```js
var Intl = require('org.home.intl');
document.body.textContent = Intl._('hi', 'Boss');
```

## src/mod/org.home.module.dep
Special dependencies in JSON format:
* __js__ {array|string}: Javascript files that will be added verbatim to `@org.home.module.js`.
* __res__ {object}: Files to add verbatim to the output folder. The _key_ is the destination filename and the _value_ is the source filename. If the _value_ is an empty string, that means that both files have the same name. I.e. `{ "a.txt": "" }` is the same as `{ "a.txt": "a.txt" }`.
* __var__ {object}: Converted into the `GLOBAL` variable in your module. Each _value_ is the name of a text file. The content will be the _value_ in `GLOBAL`. This can be usefull for WebGL shaders codes.

## src/mod/org.home.module.wrk
__TODO__

A [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) is independent from the rest of the code. It must lie in its own file and not be included in `@org.home.module.js`.

## src/mod/org.home.module/




----

[Back](../README.md)
