require("tfw.binding.property-manager",function(t,e,n){function r(t){Object.defineProperty(this,"id",{value:v++,writable:!1,configurable:!1,enumerable:!0}),this.name=this.id,this._props={},this._container=t}function i(t,e,n,r){d.isList(n)&&n.removeListener(e.contentListener),d.isList(r)&&r.addListener(e.contentListener)}function o(t,e){var n=this;Object.defineProperty(this._container,t,{get:n.get.bind(n,t),set:n.change.bind(n,t),enumerable:!0,configurable:!1});var i,o=void 0;i="function"==typeof e.cast?"function"==typeof e.set?function(t){e.set(e.cast(t,n))}:function(t){o=e.cast(t,n)}:"function"==typeof e.set?e.set:function(t){o=t};var a={event:new y,filter:f(e.filter),converter:f(e.converter),delay:s(e.delay),action:null,alwaysFired:!!e.alwaysFired,timeout:0,contentListener:r.prototype.fire.bind(this,t),get:"function"==typeof e.get?e.get:function(){return o},set:i};return this._props[t]=a,void 0!==e.init&&this.set(t,e.init),a}function a(t,e){t.delay?(clearTimeout(t.timeout),t.timeout=setTimeout(e,t.delay)):e()}function c(t,e){throw e=void 0===e?"":"::"+e,Error("[tfw.binding.property-manager"+e+"] "+t)}function s(t){return"number"!=typeof t?0:isNaN(t)?0:Math.max(0,Math.floor(t))}function f(t){if("function"==typeof t)return t}function u(t,e){return d.isList(t)&&d.isList(e)?t._array!==e._array:t!==e}var p=function(){function e(){return r(n,arguments)}var n={en:{},fr:{}},r=t("$").intl;return e.all=n,e}(),y=t("tfw.event"),d=t("tfw.binding.list"),v=0;r.prototype.set=function(t,e){this.create(t).set(e)},r.prototype.get=function(t){return this.create(t).get()},r.prototype.propertyId=function(t){return this.create(t).id},r.prototype.fire=function(t,e){var n=this.create(t);n.event.fire(n.get(),t,this._container,e)},r.prototype.change=function(t,e,n){void 0===n&&(n=[]);var r=this.create(t),o=r.converter;"function"==typeof o&&(e=o(e));var c=r.get();if(r.alwaysFired||u(e,c)){r.set(e);var s=this;a(r,function(){s.fire(t,n)}),i(t,r,c,r.get())}},r.prototype.converter=function(t,e){var n=this.create(t);if("function"==typeof e)n.converter=e;else if(void 0!==e)throw Error("[tfw.binding.property-manager::converter] `converter` must be of type function or undefined!");return n.converter},r.prototype.delay=function(t,e){var n=this.create(t);if(e=parseFloat(e),isNaN(e))return n.delay;n.delay=e},r.prototype.on=function(t,e){this.create(t).event.add(e)},r.prototype.off=function(t,e){this.create(t).event.remove(e)};var l="__tfw.property-manager__";e.exports=function(t){void 0===t&&c("Argument `container` is mandatory!");var e=t[l];return e||(e=new r(t),t[l]=e),e},e.exports.isLinkable=function(t,e){return void 0!==t[l]&&("string"!=typeof e||void 0!==t[l]._props[e])},e.exports.getAllAttributesNames=function(t){return void 0===t[l]?[]:Object.keys(t[l]._props)},r.prototype.create=function(t,e){return void 0===e&&(e={}),"string"!=typeof t&&c("propertyName must be a string!"),this._props[t]||o.call(this,t,e)},r.prototype.createAction=function(t,e){return void 0===e&&(e={}),e.alwaysFired=!0,this.create(t,e)},e.exports._=p});
//# sourceMappingURL=tfw.binding.property-manager.js.map