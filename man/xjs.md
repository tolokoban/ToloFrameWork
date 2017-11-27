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

### Defining HTML elements
```{TEXTAREA cols: 80 rows: 5 "Hello world!"}```
```{UL [
  {LI [{B First} ": Arthur."}]}
  {LI [{B Second} ": Bonjovi."}]}
]}```

* `"0"`: The element name must be uppercase.
* `"1"`: The children cvan be of three types:
    * __array__: array of elements to add.
    * __string__: textContent.
    * __binding__: content is binded to a linkable property.
* Named attributes are directly mapped to the HTML element attributes.

#### Events

#### CSS Classes manipulation
You can set CSS classes in a static way:
```{DIV class: "elevation-8 round"}```
or in a bound way:
```{DIV class: {Bind style}}```

You can also bind the existence of a given class to a boolean property:
```
// Add class `elevation-8` if and only if `pressed === true`.
{DIV class.elevation-8: {Bind pressed}}
```
```
// Add class `highlight` if and only if `pressed === false`.
{DIV class.|highlight: {Bind pressed}}
```
```
// If `pressed === true`, add class `elevation-8`, otherwise add class 'elevation-2'.
{DIV class.elevation-8|elevation-2: {Bind pressed}}
```

And if you need a more complex logic to set classes, you can use code behind:
```
// As soon as `flat` or `pressed` has changed, call teh code behind function
// `computeClass()` to return an array of classes to set.
{DIV class.*: {Bind [flat, pressed] computeClasses}}
```

It is possible to define a list of functions:
```
{DIV class.*: [
  {Bind [flat, pressed] computeClassesWhenPressed}
  {Bind [flat, enabled] computeClassesWhenEnabled}
]}
```
