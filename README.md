# ToloFrameWork

Javascript/HTML/CSS compiler for web or nodewebkit apps using modules in the nodejs style.

> Convention over configuration.

## Installation
```
    npm install -g toloframework
```

## Files structure convention

* __package.json__: 
* __src/index.html__: 
* __src/mod/org.home.module.js__: Module javascript code.
* __src/mod/org.home.module.css__: Cascading style sheet.
* __src/mod/org.home.module.ini__: Internationalization.
* __src/mod/org.home.module.dep__: Dependencies.
* __src/mod/org.home.module.wrk__: WebWorker.
* __src/mod/org.home.module/__: CSS resources.

### package.json
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

### src/index.html
```html
<x-html app="org.home.module" title="My super App"></x-html>
```

### src/mod/org.home.module.js
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


### src/mod/org.home.module.css
If this module is used, the CSS is added to `css/@index.css` file.

### src/mod/org.home.module.ini
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

### src/mod/org.home.module.dep

### src/mod/org.home.module.wrk

### src/mod/org.home.module/




