ToloFrameWork
=============

Javascript/HTML/CSS compiler for Firefox OS or nodewebkit apps using modules in the nodejs style.

Overview
========

Create a new project's skeleton in any directory by just typing:
```
tfw
```

The following directory structure will be created:
* `scr/`: html files.
* `src/mod/`: javascript modules (similar to nodejs modules).
* `www/DEBUG/`: resulting project in DEBUG mode.
* `www/RELEASE/`: resulting project in RELEASE mode. All javascript and CSS will be minifieds.
* `tmp/`: used to prevent from recompiling files that didn't changed. Remove it if you need a full rebuild.
* `project.tfw.json`: project configuration (see below).

Installation
============

```
    npm install -g toloframework
```

project.tfw.json
================

Here is an example:
```
{
  "name": "My wonderful App",
  "version": "1.4.12",
  "type": "nodewebkit"
}
```

* `name`: Your application's title.
* `version`: The version number. It will be incremented every time you compile the project.
** `1.4.12` will become `1.4.13`,
** `1.4.18405492` will become `1.4.18405493`,
** `1.4` will become `1.4.0`,
** and `1` will become `1.0.0`
* `type`: "firefoxos" or "nodewebkit". Default is "firefoxos".