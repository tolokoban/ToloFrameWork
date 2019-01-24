"use strict";

const
    Fatal = require("./fatal"),
    UglifyJS = require("uglify-js");


/**
 * @param {object} args -
 *   * __name__ {string}: Name of the Javascript.
 *   * __content__ {string}: Javascript source content.
 *
 * @return {object}
 *   * __src__ {string}: Verbatim Javascript source content.
 *   * __zip__ {string}: Minified version of the Javascript content.
 *   * __map__ {object}: SourceMap object.
 */
exports.minify = function minify(args) {
    try {
        const
            minification = UglifyJS.minify(args.content, {
                compress: true,
                fromString: true,
                outSourceMap: `${args.name}.map`
            }),
            transitionalSourceMap = JSON.parse(minification.map),
            sourceMap = {
                version: transitionalSourceMap.version,
                file: transitionalSourceMap.file,
                sources: [args.name],
                sourcesContent: [args.content],
                names: transitionalSourceMap.names,
                mappings: transitionalSourceMap.mappings
            };
        return {
            src: args.content,
            zip: minification.code,
            map: sourceMap
        };
    } catch (ex) {
        Fatal.fire(
            `UglifyJS complains: ${ex.message}\n\n${Fatal.extractCodeAtPos( args.content, ex.pos )}`,
            args.name,
            args.name
        );
    }
    return null;
};