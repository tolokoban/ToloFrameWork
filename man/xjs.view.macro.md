# Preprocessed macros

Expand variables and return the resulting object.
A  variable is  writtent like  this `%VarName%`.
And it  set like this: `%VarName%: "blabla"`.
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

It also possible to concatenate variables:
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

