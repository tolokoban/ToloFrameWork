require("tfw.binding.link",function(n,e,o){function t(n,e,o,t){var r=this,a=[];return n[t].forEach(function(t,c){if(t.open){p(t.obj);n[o].forEach(function(o,s){if("string"==typeof o.name&&"string"==typeof t.name&&o.obj===t.obj&&o.name===t.name)return console.error("It is forbidden to bind a property on itself! ("+s+" -> "+c+")"),void console.info("[tfw.binding.link] args=",n);var f=p(o.obj),l=i.bind(r,o,t,e);f.on(o.name,l),a.push({pm:f,name:o.name,slot:l})})}}),a}function r(n,e){this.destroy=function(){n.forEach(function(n){n.pm.off(n.name,n.slot)}),e.forEach(function(n){n.pm.off(n.name,n.slot)})}}function i(n,e,o,t,r,i,a){var c=this,s=p(n.obj),y=p(e.obj);return this.name&&console.log("Link "+this.name+": ",{src:n,dst:e,id:o,value:t,propertyName:r,container:i,wave:a}),f(o,a)?void(this.name&&console.log("...has been BLOCKED by the wave! ",a)):(t=b(t,n,e),t=u(t,e,s),t=m(t,n,e),l(t,n,e)?void(this.name&&console.log("...has been FILTERED!")):(t=h(t,n,e),void("number"==typeof e.delay?(this.name&&console.log("...has been DELAYED for "+e.delay+" ms!"),clearTimeout(e._id),e._id=setTimeout(function(){c.name&&(console.log("Link "+c.name+" (after "+e.delay+" ms): ",{src:n,dst:e,id:o,value:t,propertyName:r,wave:a}),console.log("...try to change a value. ",{propertyName:e.name,value:t,target:Object.keys(e.obj["__tfw.property-manager__"])})),y.change(e.name,t,a)},e.delay)):(this.name&&console.log("...try to change a value. ",{propertyName:e.name,value:t,target:Object.keys(e.obj["__tfw.property-manager__"])}),y.change(e.name,t,a)))))}function a(n){try{void 0===n&&s("Missing mandatory argument!"),void 0===n.A&&s("Missing `args.A`!"),Array.isArray(n.A)||(n.A=[n.A]),void 0===n.B&&s("Missing `args.B`!"),Array.isArray(n.B)||(n.B=[n.B]),this.name=n.name;var e;for(e=0;e<n.A.length;e++)c(n.A[e],e);for(e=0;e<n.B.length;e++)c(n.B[e],e)}catch(e){console.error("checkArgs( "+n+" )"),s(e,"checkArgs( <args> )")}}function c(n,e){try{if(n.action){if("function"!=typeof n.action)throw"Attribute `["+e+"].action` must be a function!";if(void 0!==n.obj)throw"["+e+"].action cannot be defined in the same time of ["+e+"].obj! They are exclusive attributes.";if(void 0!==n.name)throw"["+e+"].action cannot be defined in the same time of ["+e+"].name! They are exclusive attributes.";var o={};p(o).create("<action>",{set:n.action}),n.obj=o,n.name="<action>"}else if(void 0===n.obj&&s("Missing `["+e+"].obj`!"),void 0===n.name&&(n.name="*"),!p.isLinkable(n.obj,n.name))throw"`"+n.name+"` is not a linkable attribute.\nValid linkable attributes are: "+p.getAllAttributesNames(n.obj).join(", ")+".";void 0===n.open&&(n.open=!0)}catch(o){console.error("checkpod(",n,", ",e,")"),s(o,"checkpod( <pod>, "+e+")")}}function s(n,e){throw e=void 0===e?"":"::"+e,n+"\n[tfw.binding.link"+e+"]"}function f(n,e){if(Array.isArray(e)){if(!(e.indexOf(n)<0))return!0;e.push(n)}return!1}function l(n,e,o){if("function"==typeof o.filter)try{if(!o.filter(n))return!0}catch(n){console.error(n),s("Error in filter of link "+p(e.obj)+"."+e.name+" -> "+p(o.obj)+"."+o.name+"!")}return!1}function u(n,e,o){return"string"==typeof e.switch?o.get(e.switch):Array.isArray(e.switch)?e.switch.map(function(n){return o.get(n)}):n}function m(n,e,o){if("function"==typeof o.converter)try{return o.converter(n)}catch(n){console.error(n),s("Error in converter of link "+p(e.obj)+"."+e.name+" -> "+p(o.obj)+"."+o.name+"!")}return n}function h(n,e,o){if(n&&"function"==typeof n.map&&"function"==typeof o.map)try{return n.map(o.map)}catch(n){console.error(n),s("Error in map of link "+p(e.obj)+"."+e.name+" -> "+p(o.obj)+"."+o.name+"!")}return n}function b(n,e,o){if(void 0===o.value)return n;if("function"==typeof o.value)try{return o.value(e.name)}catch(n){console.error(n),s("Error in value("+e.name+") of link "+p(e.obj)+"."+e.name+" -> "+p(o.obj)+"."+o.name+"!")}return o.value}var y=function(){function e(){return t(o,arguments)}var o={en:{},fr:{}},t=n("$").intl;return e.all=o,e}(),p=n("tfw.binding.property-manager"),d=0,v=function(n){try{a.call(this,n);var e=d++,o=t.call(this,n,e,"A","B"),i=t.call(this,n,e,"B","A");r.call(this,o,i)}catch(e){console.error("new Link( "+n+" )"),s(e,"new Link( <args> ) "+(this.name||""))}};e.exports=v,e.exports._=y});
//# sourceMappingURL=tfw.binding.link.js.map