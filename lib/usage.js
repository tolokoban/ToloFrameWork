"use strict";

module.exports = {
    init: { desc: "start a fresh new project." },
    clean: { desc: "remove all temporary files." },
    build: { desc: "compile project in the www/ folder." },
    debug: { desc: "JS and CSS files won't be minified." },
    "no-transpilation": { desc: "JS won't be transpiled." },
    php: { desc: "add PHP services." },
    test: {
        desc: "prepare Karma tests.",
        opts: {
            dir: {
                desc: "Karma spec folder. Default is '-dir spec'.",
                args: [ "spec" ]
            }
        }
    },
    doc: { desc: "create documentation." },
    jsdoc: { desc: "create JSDoc documentation." },
    watch: { desc: "watch for files change." },
    version: { desc: "increment version number." }
};