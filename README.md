# ToloFrameWork

Javascript/HTML/CSS compiler for web or nodewebkit apps using modules in the nodejs style.

> Convention over configuration.

## Installation
```
    npm install -g toloframework
```

## Files structure convention

* `package.json`: 
* `src/index.html`: 
* `src/mod/org.home.module.js`: Module javascript code.
* `src/mod/org.home.module.css`: Cascading style sheet.
* `src/mod/org.home.module.ini`: Internationalization.
* `src/mod/org.home.module.dep`: Dependencies.
* `src/mod/org.home.module.wrk`: WebWorker.
* `src/mod/org.home.module/`: CSS resources.

### package.json
Toloframework uses the standard `package.json` file defined by [NPM](https://docs.npmjs.com/getting-started/using-a-package.json), plus the extra section `tfw`.

* `resources` {array}: list of folders to copy verbatim to the output.
* `modules` {array}: list of folders containing other modules.
* `compile`
  * `type` {"fxos"|"nw"}: _firefox OS_ or _NW.js_.
  * `files` {array}: list of regular expressions for HTML file to compile.
* `output` {string}: folder where to put the compilation result.
* `consts`
  * `all` {object}: attributes to put in the `$` module.
  * `debug` {object}: same thing but for _debug_ mode only.
  * `release` {object}: same thing but for _release_ mode only.

### src/index.html

### src/mod/org.home.module.js

### src/mod/org.home.module.css

### src/mod/org.home.module.ini

### src/mod/org.home.module.dep

### src/mod/org.home.module.wrk

### src/mod/org.home.module/




Overview
========

