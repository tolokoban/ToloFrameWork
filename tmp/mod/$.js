{"intl":"","src":"/** @module $ */require( '$', function(exports, module) {  exports.config={\r\n    name:\"toloframework\",\r\n    description:\"Javascript/HTML/CSS compiler for Firefox OS or nodewebkit apps using modules in the nodejs style.\",\r\n    author:\"Tolokoban\",\r\n    version:\"0.37.0\",\r\n    major:0,\r\n    minor:37,\r\n    revision:0,\r\n    date:new Date(2016,5,2,19,22,24)\r\n};\r\nvar currentLang = null;\r\nexports.lang = function(lang) {\r\n    if (lang === undefined) {\r\n        lang = window.localStorage.getItem(\"Language\");\r\n        if (!lang) {\r\n            lang = window.navigator.language;\r\n            if (!lang) {\r\n                lang = window.navigator.browserLanguage;\r\n                if (!lang) {\r\n                    lang = \"fr\";\r\n                }\r\n            }\r\n        }\r\n        lang = lang.substr(0, 2).toLowerCase();\r\n    }\r\n    currentLang = lang;\r\n    window.localStorage.setItem(\"Language\", lang);\r\n    return lang;\r\n};\r\nexports.intl = function(words, params) {\r\n    var dic = words[exports.lang()],\r\n    k = params[0],\r\n    txt, newTxt, i, c, lastIdx, pos;\r\n    if (!dic) {\r\n        //console.error(\"Missing internationalization for language : \\\"\" + exports.lang() + \"\\\"!\");\r\n        return k;\r\n    }\r\n    txt = dic[k];\r\n    if (!txt) {\r\n        //console.error(\"Missing internationalization [\" + exports.lang() + \"]: \\\"\" + k + \"\\\"!\");\r\n        return k;\r\n    }\r\n    if (params.length > 1) {\r\n        newTxt = \"\";\r\n        lastIdx = 0;\r\n        for (i = 0 ; i < txt.length ; i++) {\r\n            c = txt.charAt(i);\r\n            if (c === '$') {\r\n                newTxt += txt.substring(lastIdx, i);\r\n                i++;\r\n                pos = txt.charCodeAt(i) - 48;\r\n                if (pos < 0 || pos >= params.length) {\r\n                    newTxt += \"$\" + txt.charAt(i);\r\n                } else {\r\n                    newTxt += params[pos];\r\n                }\r\n                lastIdx = i + 1;\r\n            } else if (c === '\\\\') {\r\n                newTxt += txt.substring(lastIdx, i);\r\n                i++;\r\n                newTxt += txt.charAt(i);\r\n                lastIdx = i + 1;\r\n            }\r\n        }\r\n        newTxt += txt.substr(lastIdx);\r\n        txt = newTxt;\r\n    }\r\n    return txt;\r\n};\r\n\r\n\r\n\r\n \r\n/**\n * @module $\n * @see module:$\n\n */\n});","zip":"require(\"$\",function(r,n){r.config={name:\"toloframework\",description:\"Javascript/HTML/CSS compiler for Firefox OS or nodewebkit apps using modules in the nodejs style.\",author:\"Tolokoban\",version:\"0.37.0\",major:0,minor:37,revision:0,date:new Date(2016,5,2,19,22,24)};var e=null;r.lang=function(r){return void 0===r&&(r=window.localStorage.getItem(\"Language\"),r||(r=window.navigator.language,r||(r=window.navigator.browserLanguage,r||(r=\"fr\"))),r=r.substr(0,2).toLowerCase()),e=r,window.localStorage.setItem(\"Language\",r),r},r.intl=function(n,e){var o,t,a,i,g,s,u=n[r.lang()],l=e[0];if(!u)return l;if(o=u[l],!o)return l;if(e.length>1){for(t=\"\",g=0,a=0;a<o.length;a++)i=o.charAt(a),\"$\"===i?(t+=o.substring(g,a),a++,s=o.charCodeAt(a)-48,t+=0>s||s>=e.length?\"$\"+o.charAt(a):e[s],g=a+1):\"\\\\\"===i&&(t+=o.substring(g,a),a++,t+=o.charAt(a),g=a+1);t+=o.substr(g),o=t}return o}});\n//# sourceMappingURL=$.js.map","map":{"version":3,"file":"$.js.map","sources":["$.js"],"sourcesContent":["/** @module $ */require( '$', function(exports, module) {  exports.config={\r\n    name:\"toloframework\",\r\n    description:\"Javascript/HTML/CSS compiler for Firefox OS or nodewebkit apps using modules in the nodejs style.\",\r\n    author:\"Tolokoban\",\r\n    version:\"0.37.0\",\r\n    major:0,\r\n    minor:37,\r\n    revision:0,\r\n    date:new Date(2016,5,2,19,22,24)\r\n};\r\nvar currentLang = null;\r\nexports.lang = function(lang) {\r\n    if (lang === undefined) {\r\n        lang = window.localStorage.getItem(\"Language\");\r\n        if (!lang) {\r\n            lang = window.navigator.language;\r\n            if (!lang) {\r\n                lang = window.navigator.browserLanguage;\r\n                if (!lang) {\r\n                    lang = \"fr\";\r\n                }\r\n            }\r\n        }\r\n        lang = lang.substr(0, 2).toLowerCase();\r\n    }\r\n    currentLang = lang;\r\n    window.localStorage.setItem(\"Language\", lang);\r\n    return lang;\r\n};\r\nexports.intl = function(words, params) {\r\n    var dic = words[exports.lang()],\r\n    k = params[0],\r\n    txt, newTxt, i, c, lastIdx, pos;\r\n    if (!dic) {\r\n        //console.error(\"Missing internationalization for language : \\\"\" + exports.lang() + \"\\\"!\");\r\n        return k;\r\n    }\r\n    txt = dic[k];\r\n    if (!txt) {\r\n        //console.error(\"Missing internationalization [\" + exports.lang() + \"]: \\\"\" + k + \"\\\"!\");\r\n        return k;\r\n    }\r\n    if (params.length > 1) {\r\n        newTxt = \"\";\r\n        lastIdx = 0;\r\n        for (i = 0 ; i < txt.length ; i++) {\r\n            c = txt.charAt(i);\r\n            if (c === '$') {\r\n                newTxt += txt.substring(lastIdx, i);\r\n                i++;\r\n                pos = txt.charCodeAt(i) - 48;\r\n                if (pos < 0 || pos >= params.length) {\r\n                    newTxt += \"$\" + txt.charAt(i);\r\n                } else {\r\n                    newTxt += params[pos];\r\n                }\r\n                lastIdx = i + 1;\r\n            } else if (c === '\\\\') {\r\n                newTxt += txt.substring(lastIdx, i);\r\n                i++;\r\n                newTxt += txt.charAt(i);\r\n                lastIdx = i + 1;\r\n            }\r\n        }\r\n        newTxt += txt.substr(lastIdx);\r\n        txt = newTxt;\r\n    }\r\n    return txt;\r\n};\r\n\r\n\r\n\r\n \r\n});"],"names":["require","exports","module","config","name","description","author","version","major","minor","revision","date","Date","currentLang","lang","undefined","window","localStorage","getItem","navigator","language","browserLanguage","substr","toLowerCase","setItem","intl","words","params","txt","newTxt","i","c","lastIdx","pos","dic","k","length","charAt","substring","charCodeAt"],"mappings":"AAAgBA,QAAS,IAAK,SAASC,EAASC,GAAWD,EAAQE,QAC/DC,KAAK,gBACLC,YAAY,oGACZC,OAAO,YACPC,QAAQ,SACRC,MAAM,EACNC,MAAM,GACNC,SAAS,EACTC,KAAK,GAAIC,MAAK,KAAK,EAAE,EAAE,GAAG,GAAG,IAEjC,IAAIC,GAAc,IAClBZ,GAAQa,KAAO,SAASA,GAgBpB,MAfaC,UAATD,IACAA,EAAOE,OAAOC,aAAaC,QAAQ,YAC9BJ,IACDA,EAAOE,OAAOG,UAAUC,SACnBN,IACDA,EAAOE,OAAOG,UAAUE,gBACnBP,IACDA,EAAO,QAInBA,EAAOA,EAAKQ,OAAO,EAAG,GAAGC,eAE7BV,EAAcC,EACdE,OAAOC,aAAaO,QAAQ,WAAYV,GACjCA,GAEXb,EAAQwB,KAAO,SAASC,EAAOC,GAC3B,GAEAC,GAAKC,EAAQC,EAAGC,EAAGC,EAASC,EAFxBC,EAAMR,EAAMzB,EAAQa,QACxBqB,EAAIR,EAAO,EAEX,KAAKO,EAED,MAAOC,EAGX,IADAP,EAAMM,EAAIC,IACLP,EAED,MAAOO,EAEX,IAAIR,EAAOS,OAAS,EAAG,CAGnB,IAFAP,EAAS,GACTG,EAAU,EACLF,EAAI,EAAIA,EAAIF,EAAIQ,OAASN,IAC1BC,EAAIH,EAAIS,OAAOP,GACL,MAANC,GACAF,GAAUD,EAAIU,UAAUN,EAASF,GACjCA,IACAG,EAAML,EAAIW,WAAWT,GAAK,GAEtBD,GADM,EAANI,GAAWA,GAAON,EAAOS,OACf,IAAMR,EAAIS,OAAOP,GAEjBH,EAAOM,GAErBD,EAAUF,EAAI,GACD,OAANC,IACPF,GAAUD,EAAIU,UAAUN,EAASF,GACjCA,IACAD,GAAUD,EAAIS,OAAOP,GACrBE,EAAUF,EAAI,EAGtBD,IAAUD,EAAIN,OAAOU,GACrBJ,EAAMC,EAEV,MAAOD"},"dependencies":["mod/$"]}