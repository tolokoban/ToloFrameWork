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

### src/mod/org.home.module.dep

### src/mod/org.home.module.wrk

### src/mod/org.home.module/




