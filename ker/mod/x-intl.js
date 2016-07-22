/**
 * @export @function
 *
 * @description
 * Recherche l'élément domc  l'id vaut `elemId` et le  remplace par un
 * texte  internationalisé récupéré  dans le  dictionnaire de  __APP__
 * avec l'id `textId`.
 *
 * @example
 * var I = require('x-intl');
 * I( '_I66', 'my-title' );
 */
module.exports = function( elemId, textId ) {
    var elem = document.getElementById( '_I' + elemId );
    if (!elem) {
        console.error("[x-intl] Element not found: " + JSON.stringify(elemId));
        return false;
    }
    if (!APP) {
        console.error("[x-intl] APP is missing!");
        return false;
    }
    var text = APP._(textId) || textId;
    if (text.substr(0, 6).toLowerCase() == '<html>') {
        // This is an HTML content.
        elem.innerHTML = text.substr(6);
        elem.setAttribute( 'style', 'display:inline' );
    } else {
        // This is a pure text.
        elem.parentNode.replaceChild(
            document.createTextNode( text ),
            elem
        );        
    }
    return true;
};
