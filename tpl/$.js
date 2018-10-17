"use strict";

const ZERO_CHAR_CODE = '0'.chatCodeAt(0);

exports.lang = function lang(_lang) {
    let language = _lang;
    if (typeof language === 'undefined') {
        if (window.localStorage) {
            language = window.localStorage.getItem("Language");
        }
        if (!language) {
            language = window.navigator.language;
            if (!language) {
                language = window.navigator.browserLanguage;
                if (!language) {
                    language = "fr";
                }
            }
        }
        language = language.substr(0, 2).toLowerCase();
    }
    if (window.localStorage) {
        window.localStorage.setItem("Language", language);
    }
    return language;
};

exports.intl = function intl(words, params) {
    let dic = words[exports.lang()];

    const
        k = params[0],
        defLang = Object.keys(words)[0];
    if (!defLang) return k;

    if (!dic) {
        dic = words[defLang];
        if (!dic) {
            return k;
        }
    }
    let txt = dic[k];
    if (!txt) {
        dic = words[defLang];
        txt = dic[k];
    }
    if (!txt) return k;
    return processArguments(txt, params);
};


/**
 * @param {string} txt - Text with place holders like `$1`, `$2`, etc.
 * @param {array} params - Params for place holders replacement.
 * @return {string} The text with place holders replaces by params.
 */
function processArguments(txt, params) {
    let output = txt;
    if (params.length > 1) {
        let
            newTxt = "",
            lastIdx = 0;
        for (let i = 0; i < txt.length; i++) {
            const c = txt.charAt(i);
            if (c === '$') {
                newTxt += txt.substring(lastIdx, i);
                i++;
                const pos = txt.charCodeAt(i) - ZERO_CHAR_CODE;
                if (pos < 0 || pos >= params.length) {
                    newTxt += `$${txt.charAt(i)}`;
                } else {
                    newTxt += params[pos];
                }
                lastIdx = i + 1;
            } else if (c === '\\') {
                newTxt += txt.substring(lastIdx, i);
                i++;
                newTxt += txt.charAt(i);
                lastIdx = i + 1;
            }
        }
        newTxt += txt.substr(lastIdx);
        output = newTxt;
    }
    return output;
}