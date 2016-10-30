ToloFrameWork
=============

Javascript/HTML/CSS compiler for Firefox OS or nodewebkit apps using modules in the nodejs style.

Installation
============

```
    npm install -g toloframework
```

Configuration file
==================

Toloframework uses the standard `package.json` file by adding a section `tfw`.

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

Overview
========

