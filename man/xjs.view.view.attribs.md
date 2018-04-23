# view.attribs

``` js
view.attribs: {
  delete: {action}
  is-visible: {boolean true}
  flags: {booleans [true, false, false]}
  name: {string "Jhon Woo"}
  items: {strings [A B C "Dear Matt"]}
  children: {array}
  elements: {list}
  width: {unit "53px"}
  sizes: {units [64 "20vw" "50%"]}
  description: {multilang {en: "This is good", fr: "C'est bon"}}
  count: {integer 7 nan: -1}
  math-const: {integer 3.141592 nan: 0}
  display: {[portrait landscape wide narrow] landscape}
  object: {any null debug: "We got a new value!"}
}
```

Here is how to define an attribute:
* *0*: Attribute type.
* *1*: Default value.
* *behind*: Name of the code-behind function to call when the value has changed. The argument of the function is the value and the `this` operator is set to the view object.
* *debug*: If defined, a call to `console.info` will be made at each new value received by this attribute.
* *nan*: Only for _integer_ and _float_. If the value to convert is not a number (nan), use this value. 

----
[Back](xjs.view.md)
