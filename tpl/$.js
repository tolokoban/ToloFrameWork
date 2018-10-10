"use strict";

let currentLang = null;
exports.lang = function lang( _lang ) {
    let language = _lang;
    if ( typeof language === 'undefined' ) {
        if ( window.localStorage ) {
            language = window.localStorage.getItem( "Language" );
        }
        if ( !language ) {
            language = window.navigator.language;
            if ( !language ) {
                language = window.navigator.browserLanguage;
                if ( !language ) {
                    language = "fr";
                }
            }
        }
        language = lang.substr( 0, 2 ).toLowerCase();
    }
    currentLang = language;
    if ( window.localStorage ) {
        window.localStorage.setItem( "Language", language );
    }
    return language;
};
exports.intl = function intl( words, params ) {
    const
        dic = words[ exports.lang() ],
        k = params[ 0 ];
    var txt, newTxt, i, c, lastIdx, pos;

    let defLang = '';
    for ( defLang in words ) break;
    if ( !defLang ) return k;
    if ( !dic ) {
        dic = words[ defLang ];
        if ( !dic ) {
            return k;
        }
    }
    txt = dic[ k ];
    if ( !txt ) {
        dic = words[ defLang ];
        txt = dic[ k ];
    }
    if ( !txt ) return k;
    if ( params.length > 1 ) {
        newTxt = "";
        lastIdx = 0;
        for ( i = 0; i < txt.length; i++ ) {
            c = txt.charAt( i );
            if ( c === '$' ) {
                newTxt += txt.substring( lastIdx, i );
                i++;
                pos = txt.charCodeAt( i ) - 48;
                if ( pos < 0 || pos >= params.length ) {
                    newTxt += "$" + txt.charAt( i );
                } else {
                    newTxt += params[ pos ];
                }
                lastIdx = i + 1;
            } else if ( c === '\\' ) {
                newTxt += txt.substring( lastIdx, i );
                i++;
                newTxt += txt.charAt( i );
                lastIdx = i + 1;
            }
        }
        newTxt += txt.substr( lastIdx );
        txt = newTxt;
    }
    return txt;
};