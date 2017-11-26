# XJS
## View
In all this document, we will call __special object__ any object with an implicit attribute name.
That is any object with an attribute named __"0"__, like `{boolean init: true}` for instance.
Other objects, strings, numbers and so on are called __standard values__.

### Defining attributes
```
{View DIV
  view.attribs: {
    action: {action}
    content: "Click me!"
    flat: {boolean init: false}
    type: {[default primary secondary]}
  }
```
If the value of an attribute is a standard object, this object is the initial value of the attribute.
In the above example, the attribute `content` has an initial value of `"Click me!"`.

If the value is a special object, it must have this syntax:
* `"0"`: type of the attribute's value.
    * `boolean`, `string`, `integer`, `float`: ensure any value set will have this type.
    * `action`: any value you set to such an attribute, a _changed_ event will be fired with the value `false`.
      Event if the same value was already set before.
    * `[...]`: array of strings representing an enumerate. After setting any value to this attribute, you will always get an item of this array and nothing else.
      Setting a value that is not part of the defined array is the same as setting the first element of the array.
      The setting is case insensitive, but the getting is not. That means that in the above example if you set `Primary` to `type`, you will get `primary` in return.
* `init`: (_optional_) initial value. Must be a standard value.


