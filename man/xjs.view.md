# XJS
## View
In all this document, we will call __special object__ any object with an implicit attribute name.
That is any object with an attribute named __"0"__, like `{boolean init: true}` for instance.
Other objects, strings, numbers and so on are called __standard values__.

* [focus](xjs.view.focus.md): Bind the focus of an element to a linkableproperty.
* innerhtml: Bind a property to the innerHTML of an element.
* textcontent: Bind a property to the text content of an element.
* value: To use with INPUT, TEXTAREA, ...
* [view.attribs](xjs.view.view.attribs.md): Define linkable attributes of the view.
* view.debug: Boolean used to activate/deactivate the debug mode.
* view.id: .
* view.init: .
* [view.children](xjs.view.view.children.md): Bind chldren of an element to an array or a list.
* attrib.<names>: .
* class.<names>: .
* class.*: .
* [event.<event-name>]({xjs.view.event.md}): Adding events and gestures handlers.
* [on.<attrib-name>](xjs.view.on.md): Call a function from code behind as soon as the attribute's value changed.
* style.<name>: .
* {Bind ...}: .
* {Intl ...}: .
* %macro%: .

### Code behind
Even if XJS.View has been made as powerful as possible, there are still cases where Javascript code is needed.
Here is a dummy example to show you how to use code behind. The view will add a new line when its `value` attribute will be set.

__foobar.js__
```js
var CODE_BEHIND = {
  onValueChanged: function( value ) { this.$.appendChild( document.createTextNode( value + "\n" ) ); }
};
```

__foobar.xjs__
```
{View PRE
  view.attribs: {
    value: {string behind: onValueChanged }
  }}
```


### Defining HTML elements
```
{TEXTAREA cols: 80 rows: 5 "Hello world!"}
```

```
{UL [
  {LI [{B First} ": Arthur."}]}
  {LI [{B Second} ": Bonjovi."}]}
]}
```

* `"0"`: The element name must be uppercase.
* `"1"`: The children cvan be of three types:
    * __array__: array of elements to add.
    * __string__: textContent.
    * __binding__: content is binded to a linkable property.
* Named attributes are directly mapped to the HTML element attributes.

#### Events

#### CSS Classes manipulation
You can set CSS classes in a static way:
```
{DIV class: "elevation-8 round"}
```
or in a bounded way:
```
{DIV class: {Bind style}}
```

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
