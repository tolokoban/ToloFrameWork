# XJS

In all XJS documentation we will call __special object__ any object with an implicit attribute name.
That is any object with an attribute named __"0"__, like `{boolean init: true}` for instance.
Other objects, strings, numbers and so on are called __standard values__.

* [{View ...}](xjs.view.md)

## Preprocessed macros

Expand variables and return the resulting object.

A  variable is  written like  this `%VarName%`, and it is set like this: `%VarName%: "blabla"`.
The value of a variable can be of any type.
Variables defined  in the  value of  another variables  are expanded only when the parent variable is expanded.

```js
{View SECTION
  %Button%: {tfw.view.button type: %Type% }
  %Type%: primary
  [
    {ARTICLE class: thm-bg3 %Button%}
    {ARTICLE class: thm-bgSL %Button%}
  ]}
```

It also possible to concatenate variables with the "`+`" syntax:
```js
view.attribs: {
  duration: {String}
  duration-selected: {Boolean true}
  level: {String}
  level-selected: {Boolean true}
}
%selected%: "-selected"
%Component%: {tfw.view.checkbox value: {Bind %type%+%selected%} content: {Bind %type%}}
[
  {%Component% %type%: duration}
  {%Component% %type%: level}
]
```

