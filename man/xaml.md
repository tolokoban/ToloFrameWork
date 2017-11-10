File `tfw.view.checkbox`:
```xml
<View>
  <View.Property name="text" type="tfw.view.converter.string" />
  <View.Property name="value" type="tfw.view.converter.boolean" init="false" />
  <View.Property name="prefixed" type="tfw.view.converter.boolean" init="false" />
  <div class="tfw.view.checkbox">
    <div.event name="click" slot="onClick" />
    <div.class name="prefixed" added="{Link prefixed}" />
    <div class="text"/>
    <div class="value">
      <div.class name="checked" added="{Link value}" />
      <div/>
    </div>
  </div>
</View>
```
