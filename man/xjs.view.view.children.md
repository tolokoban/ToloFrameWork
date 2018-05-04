# view.children

Two syntaxes are accepted: `{Bind...}` or `{List...}`.

## view.children: {Bind...}

```
{View DIV
  view.attribs: {
    children: {array}
  }
  [ {UL view.children: {Bind children map:makeListItem}} ]
}
```

As soon as a new array is assigned to the linkable property, the children of the element are recreated.
If `map` is defined, it will be the name of a mapping function from code behind.
This function is used to transform each item or the new array to a DOM element to add.


## view.children: {List...}

```
{View DIV
  view.attribs: {
    children: {list}
  }
  [ {UL view.children: {List children map:makeListItem}} ]
}
```

Code behind:
```js
var CODE_BEHIND = {
  makeListItem: function( text ) {
    var li = document.createElement( "li" );
    li.textContent = text;
    return li;
  }
};
```

This is very similar to the previous syntax except that the linkable property must be a **List**.
In this case, the elements children can be recreated event if the content of the array has changed.


For instance, if you _push_ an item into a list, the display will change, whereas the action in a _{Bind...}_ syntax does not change the display because the array is not a new one, it has just changed.

## Map function

Here is an example of function provided in the code behind as a map:
```js
var CODE_BEHIND = {
  makeStudentItem: function( student, more ) {
    if( more.context.lastGroup != student.group ) {
      var grp = document.createElement( "li" );
      grp.textContent = student.group;
      more.context.lastGroup = student.group;
      var content = document.createElement( "ul" );
      more.context.content = content;
      grp.appendChid( content );
      return grp;
    }
    var li = document.createElement( "li" );
    li.textContent = student.name;
    more.context.content.appendChild( li );
  }
};
```
