File `tfw.view.checkbox`:
```xml
<View>
  <View.property name="text" type="string" />
  <View.property name="value" type="boolean" init="false" />
  <View.property name="prefixed" type="boolean" init="false" />
  <div class="tfw-view-checkbox">
    <div.event name="click" slot="onClick" />
    <div.class name="prefixed" added="{Link prefixed}" />
    <div class="text" dom.textContent="{Link text}" />
    <div class="value">
      <div.class name="checked" added="{Link value}" />
      <div/>
    </div>
  </div>
</View>
```

Code behind:
```js
function onClick() { this.value = !this.value; }
```

Generate code:
```js
function onClick() { this.value = !this.value; }

var View = require("tfw.view");
var Binding = require("tfw.binding");
var ConverterString = require("tfw.binding.converters.string");
var ConverterBoolean = require("tfw.binding.converters.boolean");
module.exports = function() {
  var that = this;
  Binding.defProps( that, {
    text: { cast: ConverterString },
    value: { cast: ConverterBoolean, init: false },
    prefixed: { cast: ConverterBoolean, init: false }
  });
  
  var create = document.createElement.bind( document );
  var append = document.appendChild.bind();
  var att = document.setAttribute.bind();
  var on = document.addEventListener.bind();
  
  var e0 = create("div");
  att( e0, "class", "tfw-view-checkbox" );
  var e00 = create("div");
  att( e00, "class", "text" );
  Binding.on( that, 'text', function() {
    e00.textContent = that.text;
  });
  
  Binding.readonly( this, "$", e0 );
}
```
