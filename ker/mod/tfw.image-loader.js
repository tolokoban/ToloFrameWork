/**
 * @module
 * Charger des images de façon asynchrone.
 */
require("polyfill.promise");

/**
 * Retourne un promise dont le data du _resolve_ est un dictionnaire avec les
 * l'URL de chaque image en clef et en valeur soit l'image chargée, soit une `string`
 * décrivant l'erreur.
 * Il n'y a donc jamais aucun appel
 * @param src URL vers une image ou tableau d'URLs vers des images.
 */
module.exports = function(src) {
    if (!Array.isArray(src)) src = [src];
    var urls = [];
    src.forEach(function(url) {
      if (urls.indexOf( url ) == -1) {
        urls.push( url );
      }
    });
    return new Promise(
        function(resolve, reject) {
            var result = {};
            var size = src.length;
            var next = function() {
                size--;
                if (size <= 0) resolve(errors);
            };
            urls.forEach(
                function(url) {
                    var img = new Image();
                    result[url] = img;
                    img.onload = next;
                    img.onerror = function(err) {
                        result[url] = err;
                        next();
                    };
                    img.src = url;
                }
            );
        }
    );
};
