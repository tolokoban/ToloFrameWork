# {Bind property converter:... }
## converter, back.converter
Examples:
```
{tfw.view.button view.id:btn1 enabled:{Bind items converter:isNotEmpty}}
{tfw.view.button view.id:btn2 action:{Bind fire back.converter:{Const DONE!}}}
{DIV textContent:{Bind btn1/action converter:{Const DONE!}}}
{DIV textContent:{Bind btn2/action}}
```

[More on the converter syntax](xjs.view.converter.md).
