# ToloFrameWork

Javascript/HTML/CSS compiler for Web Apps, Firefox OS Apps or NodeWebkit Apps using modules in the nodejs style.

# Installation

```
    npm install -g toloframework
```

# Overview

Create a new project's skeleton in any directory by just typing:
```
tfw init
```

# ToloPackages

This is a folder with this special content :

* __src/mod__: Javascript modules in the common-js style (using require).
* __src/wdg__: Widgets are web components expanded at compile time. Each widget must be placed in a subfolder with its name. For example, the code for widget `<w:include>` must lies in `src/wdg/include`.
* __src/env__: Environments are classes that can build the whole project. You can have environments for Firefox OS, brower bases apps, NodeWebkit projets, Firefox Add-ons, ...

The lookup for tolopackages is the following:

* Current project
* `node_modules/tfw-*` in current project
* Toloframework's folder

In `node_modules` you can find widgets with the same name. In this case, the alphabetical orders resolves the tie. For instance, `node_modules/tfw-bob/wdg/logger` will hide `node_modules/tfw-john/wdg/logger`.
For modules, there is a little subtility. Lets say we have two tolopackages A and B with the following modules: `A.input.js`, `B.input.js` and `B.menu.js` (which requires `input.js`). If you need `input.js` from another tolopackage, you will get `A.input.js` because of the alphabetical order. But when `B.menu.js` needs `input.js`, it will get `B.input.js` because the system will look in the current tolopackage first.

# Widget

This is a class with the name `widget.js`. It must provide a method called `parse(lexer)` which takes one argument: the __lexer__.
Here are the methods of the __lexer__:

* __next()__: return the next token.
* __back(count)__: return `count` tokens backward. Defaut value for `count` is 1.
* __open(filename)__: read another HTML file. The `next()` method will return tokens from this new file until its end has been reached. Then, the current file is read in turn.
* __expand(token)__: expand a token and return an array of new tokens.
* __name()__: return the source's name without the `.html` extension.
* __flush(tokens, pagename)__: add `tokens` to the output HTML page. `pagename` is optional and it must not contain the `.html` extension. This argument is used when you want to output more than one wbe page from only one source.
* __globals()__: return a dictionary of global variables.

# Tokens

Tokens are methodless objects which must provide at leat one attribute : `id`. Here is a list of tokens by IDs:

* Provided by the lexer
  * __tag__: HTML tag (ex: <div class="toto">).
    * __name__: tag name (including namespace).
    * __open__: `true` is it is an opening tag.
    * __close__: `true` is it is an closing tag. A tag can be self closing. In this case, both `open` and `close` are set to `true`.
    * __attributes__: tag's attributes.
  * __pi__: Processing Instruction (ex: <?xml version="1.0" encoding="UTF-8"?>).
    * __name__: pi name (`xml` in the example).
    * __attributes__: pi's attributes.
  * __directive__: HTML directive (ex: )
    * __text__: content between `<!` and `>`.
  * __entity__: HTML entity (ex: <!DOCTYPE html>).
  * __cdata__: HTML CDATA (ex: <![CDATA[this is verbatim]]).
    * __text__: verbatim content of the CDATA.
  * __comment__: HTML comment (ex: <!-- This is a comment -->).
    * __text__: content between `<!--` and `-->`.
  * __text__: text node.
    * __text__: text.
* Provided by widgets
 * __require__: 
   * __name__: javascript module required.
 * __css__: CSS stylesheet to load in the <HEAD>. You must choose only one of the following attributes.
   * __src__: local file containing the style.
   * __cdn__: URL of an external stylesheet.
   * __text__: content of the style.
 * __javascript__: javascript to load in the <HEAD>. You must choose only one of the following attributes.
   * __src__: local file containing the script.
   * __cdn__: URL of an external javascsript.
   * __text__: content of the script.
 * __worker__: WebWorkers need to have their code is a separate file.
   * __name__: file name.
   * __text__: javascript content.
 * __resource__: file to add to the final output.
   * __src__:
   * __dst__: 

## Special attributes

* __key__: if a token needs to be unique, it should bare this attribute. If there are several tokens with the same `key`, only the first is used. The others are ignored. Usefull if a widget need pieces of Javascript to work, but it is used many times in the same HTML page.


# Environment

This is a class with the name `env.js`.  It must provide a method called `build(runtime)` which takes one argument: the __runtime__.
Here are the methods of the __runtime__:

* __pages()__: dictionary of pages. The key is the page name, the value is an array of tokens.
* __debugDir(path)__:
* __releaseDir(path)__:


# project.tfw.json


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
* `html-filter` (_string_ or _array_): filter or list of filters of html pages to be built. Files are searched from the `src/` directory. Each filter is made of regular expressions separated with `/`. Hence, `^a/\\.html$` means every file with `.html` as extension and which lies in a directory whose name starts with `a`.
