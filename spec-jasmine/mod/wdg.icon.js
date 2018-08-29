require("wdg.icon",function(o,r,t){function e(o,r,t){if(a.clear(r),"string"==typeof t){var e=f.Icons[t.trim().toLowerCase()];if(void 0!==e)t=e;else try{t=JSON.parse(t)}catch(o){return console.error("[wdg.icon:content] Bad value: ",t),void console.error(o)}}if(!Array.isArray(t))return void console.error("[wdg.icon:content] Value must be an array: ",t);try{i.call(this,o,r,t)}catch(o){console.error("[wdg.icon:content] Bad content: ",t),console.error(o)}}function i(o,r,t){if("string"==typeof t){var e=window.document.createTextNode(t);return void r.appendChild(e)}if(!Array.isArray(t)||0==t.length)return console.error("[wdg.icon:content] `child` must be an array: ",t),void console.error("parent = ",r);var n;t.forEach(function(t,e){var s,c;if(0==e)n=a.svg(t),a.add(r,n);else if("string"==typeof t)a.addClass(n,t);else if(Array.isArray(t))t.forEach(function(r){i.call(this,o,n,r)},this);else if("object"==typeof t)for(s in t)c=""+t[s],("fill"==s||"stroke"==s)&&l.indexOf(c)>-1&&"01".indexOf(c)>-1&&(void 0===o[c]&&(o[c]={fill:[],stroke:[]}),o[c][s].push(n)),a.att(n,s,c)},this)}var n=function(){function r(){return e(t,arguments)}var t={en:{}},e=o("$").intl;return r.all=t,r}(),a=o("dom"),s=o("tfw.data-binding"),c=o("tfw.icons"),l=(o("tfw.touchable"),["0","1","P","PL","PD","S","SL","SD"]),f=function(o){var r=this,t=[],i=a.svg("g",{"stroke-width":6,fill:"none","stroke-linecap":"round","stroke-linejoin":"round"}),n=a.svgRoot("wdg-icon",{width:"100%",height:"100%",viewBox:"-65 -65 130 130",preserveAspectRatio:"xMidYMid meet"});a.elem(this,n);a.add(n,i),s.prop(this,"value"),s.propBoolean(this,"rotate")(function(o){o?a.addClass(n,"rotate"):a.removeClass(n,"rotate")}),s.propUnit(this,"size")(function(o){var r=o.v+o.u;a.css(n,{width:r,height:r,"line-height":r})}),s.propAddClass(this,"wide"),s.propRemoveClass(this,"visible","hide");var c=function(o){var e=t[o];if(void 0!==e){e.fill.forEach(function(o){l.forEach(function(r){a.removeClass(o,r)}),a.removeAtt(o,"fill")}),e.stroke.forEach(function(o){l.forEach(function(r){a.removeClass(o,r)}),a.removeAtt(o,"stroke")});var i=""+r["color"+o];l.indexOf(i)>-1?(e.fill.forEach(function(o){a.addClass(o,"fill"+i)}),e.stroke.forEach(function(o){a.addClass(o,"stroke"+i)})):(e.fill.forEach(function(o){a.att(o,"fill",i)}),e.stroke.forEach(function(o){a.att(o,"stroke",i)}))}};s.prop(this,"content")(function(o){e.call(r,t,i,o);for(var n=0;n<2;n++)c(n)});for(var f=0;f<2;f++)s.propColor(this,"color"+f)(c.bind(this,f));o=s.extend({content:["circle",{stroke:1,fill:0,r:90,cx:0,cy:0}],color0:"0",color1:"1",angle:0,size:"2rem",value:"icon",rotate:!1,wide:!1,visible:!0},o,this)};f.Icons=c.iconsBook,f.draw=c.draw,f.path2=c.path2,f.register=c.register,r.exports=f,r.exports._=n});
//# sourceMappingURL=wdg.icon.js.map