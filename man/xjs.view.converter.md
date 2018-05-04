# Converters
A __converter__ is a function which transforms its unique argument.


### Simple converter

Toloframework provides a bunch of simple converters. You can use one of them by just providing its name.

* **array**: If the input value is an array, return it verbatim. Otherwise, return an array with the input value as only element.
* **boolean**: Convert the value into a Boolean. If the value is a string, the result is true only if the string is `true`. For numbers, the result is true only if the value is not zero.
* **booleans**: Convert into an array of booleans. If the value is not an array, the result is an empty array.
* **color**: Convert a CSS color string value into a CSS color in the format `"#RRGGBB"` or `"#RRGGBBAA"`. If the value is not a string, the result is `"#000000"`. If the value is not a valid CSS color, the result is `false`.
* **intl**: This converter works in the opposite way of __multilang__. If the input value is an object, it will return the value of the attribute with the current user's language as key. That is, if the current language is `en`, then the input `{fr: {greetings: "Bonjour"}, en: {greetings: "Good morning"}}` will give `"Good morning"`. If the input value is a string, it is returned verbatim. Finally, if the input value is `undefined`, an empty string is returned.
* **isEmpty**: Use the __length__ converter. If the result is 0, return `true`, otherwise return `false`.
* **isNotEmpty**: Use the __length__ converter. If the result is 0, return `false`, otherwise return `true`.
* **keys**: If the input is an object, return an array with the keys of this object. Otherwise, return an empty array.
* **length**: if the input value is a string, return the length of the string. Is the input is an object with an attribute `length` which is a number, return the value of this attribute (arrays have a `length` attribute). Otherwise, return 0.
* **list**: Similar to __array__, but returns a `List`. A `List` is an array aware of its elements. You can listen at it to know when an item is added or removed.
* **multilang**: The expected result is a multilang object. That is something like `{fr: {greetings: "Bonjour"}, en: {greetings: "Good morning"}}`. This converter doesn't check is the final objet is a good one. If the input is an object, it returns the object as is. For other types, the result is an object with one item: the key will be the current user's language and the value will be the input value.
* **not**: Convert the input value into a boolean, then return the complement of this boolean.
* **sortedKeys**: Same as __keys__ but the returned array is sorted (ascending alphabetical order).
* **string**: Convert the input value into a string.
* **strings**: Convert the input value into an array of strings.
* **unit**: Convert the input value into a CSS unit. If the input is a number, return this number with `px` appened to it. If the input is not a string or if it is not a valid CSS unit, return `"0"`.
* **units**: Convert the input value into an array of CSS units. (see __unit__ converter).
* **validator**: Convert the input value into a _validator_. A _validator_ is a function which returns a boolean when a string is given. If the input is a function, return it verbatim. If the input is an empty string, return a function which alwas returns `true`. If the input is a non-empty string, return a function which tests the regular expression defined by this string. In all other cases, return the constant function which always return `true`.


