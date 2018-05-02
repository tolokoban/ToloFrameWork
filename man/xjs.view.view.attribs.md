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
* __0__: Attribute type.
    * `boolean`, `string`, `integer`, `float`: ensure any value set will have this type.
    * `action`: any value you set to such an attribute, a _changed_ event will be fired with the value, even if the same value was already set before.
    * `[...]`: array of strings representing an enumerate. After setting any value to this attribute, you will always get an item of this array and nothing else. Setting a value that is not part of the defined array is the same as setting the first element of the array. The setting is case insensitive, but the getting is not.
* __1__: Default value.
* __behind__: Name of the code-behind function to call when the value has changed. The argument of the function is the value and the `this` operator is set to the view object.
* __debug__: If defined, a call to `console.info` will be made at each new value received by this attribute.
* __nan__: Only for _integer_ and _float_. If the value to convert is not a number (NaN), use this value. 

----
[Back](xjs.view.md)
