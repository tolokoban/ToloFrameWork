require("dom",function(e,r,t){function n(e,r,t){return Object.defineProperty(e,"element",{value:r,writable:!1,configurable:!1,enumerable:!0}),t?e:(e.on=v.bind(e,r),e.css=i.bind(e,r),e.add=l.bind(e,r),e.att=s.bind(e,r),e.addClass=y.bind(e,r),e.hasClass=h.bind(e,r),e.removeClass=p.bind(e,r),e.toggleClass=g.bind(e,r),e)}function o(e,r){return e=O(e),r=O(r),r.parentNode.replaceChild(e,r),e}function i(e,r){e=O(e);var t,n;for(t in r)n=r[t],e.style[t]=n;return e}function s(e,r,t){e=O(e);var n,o;"string"==typeof r&&(void 0===t&&(t=""),n=r,r={},r[n]=t);for(n in r)o=r[n],e.setAttribute(n,o);return e}function a(e,r){return e=O(e),e.removeAttribute(r),e}function l(e){e=O(e);try{var r,t;for(r=1;r<arguments.length;r++)t=arguments[r],u(e,t)||f(e,t)||c(e,t)||console.error("Argument #"+r+" of dom.add() is invalid!",arguments);return e}catch(e){throw console.error("[DOM.add] arguments=",[].slice.call(arguments)),Error("[DOM.add] "+e)}}function c(e,r){return(r=O(r))instanceof Node&&(e.appendChild(r),!0)}function f(e,r){if("number"==typeof r&&(r=""+r),"string"!=typeof r)return!1;if("<html>"==r.substr(0,6).toLowerCase()){var t=r.substr(6);r=O.tag("span"),r.innerHTML=t}else if(M.test(r)){var n=r;r=O.tag("span"),r.innerHTML=n}else r=document.createTextNode(r);return e.appendChild(r),!0}function u(e,r){return!!Array.isArray(r)&&(r.forEach(function(r){l(e,r)}),!0)}function d(e){if(Array.isArray(e))return e.forEach(function(e){d(e)}),e;if(void 0===e[T])return e;var r=e[T].events;if(void 0===r)return e;r.off(),delete e[T].events}function v(e,r,t){if("function"==typeof r||null===r)r={tap:r};else if("string"==typeof r&&"function"==typeof t){var n={};n[r]=t,r=n}if(Array.isArray(e))return e.forEach(function(e){v(e,r)}),e;e=O(e),void 0===e[T]&&(e[T]={}),void 0===e[T].events&&(e[T].events=new S(e));var o,i,s;for(o in r)i=r[o],"!"==o.charAt(0)?(o=o.substr(1),s=!0):s=!1,"keydown"==o||"keyup"==o?e.addEventListener(o,i,s):e[T].events.on(o,i,s);return e}function m(e,r){try{var t,n,o,i,s=document.createElementNS(e,r.trim().toLowerCase());for(t=2;t<arguments.length;t++)if(n=arguments[t],Array.isArray(n))n.forEach(function(e){switch(typeof e){case"string":case"number":case"boolean":if(e=""+e,"<html>"==e.substr(0,6)){var r=e.substr(6);e=O.tag("span"),e.innerHTML=r}else e=document.createTextNode(e)}l(s,e)});else switch(typeof n){case"string":n.split(" ").forEach(function(e){e.length>0&&y(s,e)});break;case"object":for(o in n)i=n[o],s.setAttribute(o,i);break;default:throw Error("[dom.tag] Error creating <"+r+">: Invalid argument #"+t+"!")}return s}catch(t){console.error("[dom.tagNS] Error with `ns` = ",e," and `name` = ",r),console.error(t)}}function y(e){var r=[].slice.call(arguments,1);return Array.isArray(e)?(r.unshift(null),e.forEach(function(e){r[0]=e,y.apply(void 0,r)}),e):(e=O(e),r.forEach(function(r){if("string"==typeof r&&(r=r.trim(),0!=r.length))try{e.classList&&e.classList.add(r)}catch(e){console.error("[dom.addClass] Invalid class name: ",r),console.error(e)}}),e)}function h(e,r){return e=O(e),!!e.classList&&e.classList.contains(r)}function p(e){var r=[].slice.call(arguments,1);return Array.isArray(e)?(r.unshift(null),e.forEach(function(e){r[0]=e,p.apply(void 0,r)}),e):(e=O(e),r.forEach(function(r){if("string"==typeof r)try{e.classList&&e.classList.remove(r)}catch(e){console.error("[dom.removeClass] Invalid class name: ",r),console.error(e)}}),e)}function g(e){return[].slice.call(arguments,1).forEach(function(r){h(e,r)?p(e,r):y(e,r)}),e}function w(e){e=O(e);for(var r=e;r.firstChild;)r.removeChild(r.firstChild);var t=[].slice.call(arguments);return t.length>1&&l.apply(this,t),e}function b(e,r){return e=O(e),void 0===r&&(r=e,e=window.document),e.querySelector(r)}function A(e){e=O(e);var r=e.parentElement;return r?(r.removeChild(e),r):r}function E(e){var r=[].slice.call(arguments);r.shift(),0==r.length&&(r=["div"]),r.push("dom","custom");var t;return void 0!==r[0].element?(t=r[0].element,y(t,"dom","custom")):"function"==typeof r[0].appendChild?(t=r[0],y(t,"dom","custom")):t=O.tag.apply(O,r),Object.defineProperty(e,"element",{value:t,writable:!1,configurable:!1,enumerable:!0}),t}function C(e,r){return void 0===r&&(r=""),null===r&&(r=""),"string"!=typeof r&&(r=JSON.stringify(r)),"<html>"==r.substr(0,6)?e.innerHTML=r.substr(6):e.textContent=r,e}function x(e){if(!Array.isArray(e))return x(Array.prototype.slice.call(arguments));e.forEach(function(e){e=O(e),void 0===e[T]&&(e[T]={}),Array.isArray(e[T].style)||(e[T].style=[]),e[T].style.push(JSON.stringify(e.style))})}function L(e){if(!Array.isArray(e))return L(Array.prototype.slice.call(arguments));e.forEach(function(e){if(e=O(e),void 0===e[T]||!Array.isArray(e[T].style))throw Error("[dom.restoreStyle] `saveStyle()` has never been used on this element!");if(0==e[T].style.length)throw Error("[dom.restoreStyle] more `restore` than `save`!");var r,t,n=JSON.parse(e[T].style.pop());for(r in n)void 0!==(t=n[r])&&(e.style[r]=t)})}var N=function(){function r(){return n(t,arguments)}var t={en:{}},n=e("$").intl;return r.all=t,r}();e("polyfill.classList");var S=e("tfw.pointer-events"),O=function(e){if(e instanceof Node)return e;if(void 0===e||null===e)throw Error("`dom` is not a valid element!",e);if(e.$ instanceof Node)return e.$;if(e.element instanceof Node)return e.element;if("string"==typeof e){var r=document.getElementById(e);return r||console.error("[dom] There is no DOM element with this ID: `"+e+"`"),r}return"function"==typeof e.element?e.element():e};r.exports=O;var T="@dom"+Date.now(),M=/^&(#[0-9]+|[a-zA-Z0-9]+);$/;O.tagNS=m,O.svgRoot=m.bind(void 0,"http://www.w3.org/2000/svg","svg",{version:"1.1","xmlns:svg":"http://www.w3.org/2000/svg",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"}),O.svg=m.bind(void 0,"http://www.w3.org/2000/svg"),O.tag=m.bind(void 0,"http://www.w3.org/1999/xhtml"),O.div=m.bind(void 0,"http://www.w3.org/1999/xhtml","div"),O.txt=window.document.createTextNode.bind(window.document),O.textOrHtml=C,O.get=b,O.elem=E,O.css=i,O.att=s,O.removeAtt=a,O.addClass=y,O.hasClass=h,O.removeClass=p,O.toggleClass=g,O.saveStyle=x,O.restoreStyle=L,O.replace=o,O.detach=A,O.on=v,O.off=d,O.add=l,O.wrap=n,O.clear=w,r.exports._=N});
//# sourceMappingURL=dom.js.map