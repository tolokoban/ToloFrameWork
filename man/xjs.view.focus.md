# focus

This attribute has a special meaning when used on HTML elements that support `focus` and `blur`events.

```
{View DIV
  view.attribs: {
    focus: {boolean false}
  }
  class.focus: {Bind focus} 
  [ {INPUT focus: {Bind focus}} ]
}
```


----
[Back](xjs.view.md)
