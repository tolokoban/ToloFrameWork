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
  
  var e0 = document.createElement("div");
  e0.setAttribute( "class", "tfw-view-checkbox" );
  e0.addEventListener(
    "click",
    function( evt ) {
      onClick.call( that, evt );
    }, false );
  View.toggleClass( e0, "prefixed", that, "prefixed" );
  var e00 = document.createElement("div");
  e00.setAttribute( "class", "text" );
  Binding.on( that, 'text', function() {
    e00.textContent = that.text;
  });
  var e01 = document.createElement("div");
  e01.setAttribute( "class", "value" );
  View.toggleClass( e01, "checked", that, "value" );
  var e010 = document.createElement("div");
  e01.appendChild( e010 );
  e0.appendChild( e00 );
  e0.appendChild( e01 );
  
  Binding.readonly( this, "$", e0 );
}
```
