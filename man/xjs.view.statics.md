# view.statics

Define static functions on the view.

*`my-view.xjs`*
```js
{View DIV
  view.statics: getName
}
```

*`my-view.js`*
```js
var CODE_BEHIND = {
  getName: function() { return "My-View"; }
}
```

*`test.js`*
```js
var View = require("my-view");
console.log( "Name", View.getName() );
```

If you have several static functions, you can provide an array:
```js
{View DIV
  view.statics: [getName, incCounter]
}
```
