# XJS
## View
In all this document, we will call __special object__ any object with an implicit attribute name.
That is any object with an attribute named __"0"__, like `{boolean init: true}` for instance.
Other objects, strings, numbers and so on are called __standard values__.

* [`focus`](xjs.view.focus.md): Bind the focus of an element to a linkableproperty.
* `innerhtml`: Bind a property to the innerHTML of an element.
* `textcontent`: Bind a property to the text content of an element.
* `value`: To use with INPUT, TEXTAREA, ...
* [`view.attribs`](xjs.view.view.attribs.md): Define linkable attributes of the view.
* `view.debug`: Boolean used to activate/deactivate the debug mode.
* `view.id`: .
* `view.init`: .
* [`view.children`](xjs.view.view.children.md): Bind children of an element to an array or a list.
* `attrib.<names>`: .
* [`class.<names>`](xjs.view.class.md): Add a CSS class depending on the value of a bound boolean.
* [`class.*`](xjs.view.class.md): Add CSS classes depending on values of a bound booleans.
* [`event.<event-name>`](xjs.view.event.md): Adding events and gestures handlers.
* [`on.<attrib-name>`](xjs.view.on.md): Call a function from code behind as soon as the attribute's value changed.
* `style.<name>`: .
* [`{Bind ...}`](xjs.view.bind.md): .
* `{Intl ...}`: .
* [`%macro%`](xjs.view.macro.md): Preprocessed macros.

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

