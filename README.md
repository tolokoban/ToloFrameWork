# ToloFrameWork

Javascript/HTML/CSS compiler for web or nodewebkit apps using modules in the nodejs style.

> Convention over configuration.

## Installation
```
    npm install -g toloframework
```

## Files structure convention

* __[package.json](package.json)__: 
* __src/[index.html](index.html)__: 
* __src/mod/[org.home.module.js](module.js)__: Module javascript code.
* __src/mod/[org.home.module.css](module.css)__: Cascading style sheet.
* __src/mod/[org.home.module.ini](module.ini)__: Internationalization.
* __src/mod/[org.home.module.dep](module.dep)__: Dependencies.
* __src/mod/[org.home.module.wrk](module.wrk)__: WebWorker.
* __src/mod/[org.home.module](module)/__: CSS resources.

### package.json
[package.json]Toloframework uses the standard `package.json` file defined by [NPM](https://docs.npmjs.com/getting-started/using-a-package.json), plus the extra section `tfw`.

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
[index.html]

### src/mod/org.home.module.js
[module.js]

### src/mod/org.home.module.css
[module.css]

### src/mod/org.home.module.ini
[module.ini]

### src/mod/org.home.module.dep
[module.dep]

### src/mod/org.home.module.wrk
[module.wrk]

### src/mod/org.home.module/
[module]




Overview
========

