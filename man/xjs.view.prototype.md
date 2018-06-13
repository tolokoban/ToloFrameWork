# view.prototype

Define prototype functions on the view.

**`my-view.xjs`**:
```js
{View DIV
  view.prototype: getName
}
```

**`my-view.js`**:
```js
var CODE_BEHIND = {
  getName: function() { return "My-View"; }
}
```

**`test.js`**:
```js
var View = require("my-view");
var myview = new View();
console.log( "Name", myview.getName() );
```

If you have several static functions, you can provide an array:
```js
{View DIV
  view.prototype: [getName, incCounter]
}
```

----
[Back](xjs.view.md)
