/**
 * Specifications   for  the   Source-Map   version  3   can  be   found
 * [here](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1).
 */


// Taken from [https://en.wikipedia.org/wiki/Base64]
var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


/**
 * @param {string} mapping  - This big string is a  concatenation of the
 * lines  of the  generated  code, separated  by a  `;`.  Note that  for
 * minified generated code, it is usual to find only one line, hence you
 * will not  find any  `;` at all  in `mapping`.  Each  line is  made of
 * __segments__ separated with a `,`.
 * A                  __segment__                  is                  a
 * [VLQ](https://en.wikipedia.org/wiki/Variable-length_quantity)
 * encoding of (at most) five integers :
 * * column in the generated file,
 * * index of the  original file (see `sources`  and `sourcesContent` in
     the source-map),
 * * line number in the original file,
 * * column in the original file,
 * * index of the original name (see `names` in the source-map)
 *
 * @return {object} 
 */
exports.decodeMapping = function(mapping) {
    var generatedLineNumber = 1;
};
