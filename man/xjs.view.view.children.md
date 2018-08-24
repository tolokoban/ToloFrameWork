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
This function is used to transform each item of the new array to a DOM element to add.


## view.children: {List...}

```
{View DIV
  view.attribs: {
    children: {list}
  }
  [ {UL view.children: {List children map:makeListItem before:beforeList after:afterList}} ]
}
```

Code behind:
```js
var CODE_BEHIND = {
  makeListItem: function( text, more ) {
    var li = document.createElement( "li" );
    li.textContent = text;
    return li;
  },
  beforeList: function( context, list ) {
    list.sort();
  },
  beforeList: function( context, list ) {
    var txt = document.createElement( "p" );
    txt.textContent = "Count: " + list.length;
    return txt;
  }
};
```

This is very similar to the previous syntax except that the linkable property must be a **List**.
In this case, the elements children can be recreated event if the content of the array has changed.


For instance, if you _push_ an item into a list, the display will change, whereas the action in a _{Bind...}_ syntax does not change the display because the array is not a new one, it has just changed.

## Map function
The map function takes 2 arguments:
* __item__: An element of the list/array being iterated.
* __more__: An object for more control.
    * __more.index__: INdex of the current element (starting at 0).
    * __more.list__: The whole list/array you are iterating on.
    * __more.context__: A object to use to keep things between two elements of he loop.
    
If the function returns `null`or `undefined`, nothing is added.
It the function returns an array, each element of this array will be added.


Here is an example:
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

If your array is:
```js
var students = [
  {name: "Joe", group: "Male"},
  {name: "John", group: "Male"},
  {name: "Jean", group: "Female"},
  {name: "Emma", group: "Female"},
  {name: "Uma", group: "Female"}
]
```
You will get somwthing like this:
* Male
    * Joe
    * John
* Female
    * Jean
    * Emma
    * Uma
    
