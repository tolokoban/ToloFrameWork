"use strict";


/**
 * @param {string} text - String to capitalize.
 * @return {string} `text` with the first letter uppercased.
 */
module.exports = function(text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
};
