var Source = require("./source");
var Kernel = require("./kernel");
var Path = require("path");
var FS = require("fs");
var debugMode = true;

/**
 * Register specific compilers.
 */
var compilers = [];
[
    ["\\.html$", "html"],
    ["\\.js$", "js"],
    ["\\.css$", "css"]
].forEach(
    function(item) {
        compilers.push(
            {
                matcher: new RegExp(item[0]),
                compiler: require("./cmp/" + item[1] + ".js")
            }
        );
    }
);

/**
 * Find the corresponding compiler for a given file.
 */
function findCompiler(file) {
    var i, item;
    for (i = 0 ; i < compilers.length ; i++) {
        item = compilers[i];
        if (item.matcher.test(file)) {
            return item.compiler;
        }
    }
    return null;
};

exports.debug = Kernel.debug;

/**
 * Return the full path of a source file or directory.
 */
exports.srcPath = function(src) {
    return Path.join(Kernel.prjPath, src);
};


/**
 * Compile files if they are not uptodate.
 *
 *
 * @param pattern : relative path of  files to compile. Each part of the
 * path is a regular expression.
 */
exports.compile = function(pattern) {
    var files = [], patterns = [],
    items = pattern.split("/"),
    item, source;
    var add = function(f) {
        if (!FS.existsSync(f)) {
            // Maybe it is a source's relative path.
            f = Kernel.srcPath(f);
        }
        if (!FS.existsSync(f)) {
            throw {fatal: "File not found: " + f};
        }
        else if (!sources[f]) {
            files.push(f);
        }
    };

    // ============================================================
    // First step:
    // List sources dependencies.
    // ------------------------------------------------------------
    while (items.length > 0) {
        item = items.pop();
        patterns.push(new RegExp(item));
    }
    Kernel.expandPattern(Kernel.srcPath(), patterns, files);
    if (files.length == 0) {
        console.log(("No file matches this pattern:\n    " + pattern).err());
        return;
    }
    var sources = {}, file, index = 0;
    while (files.length > 0) {
        file = files.pop();
        if (!sources[file]) {
            // Analyse only files not yet analysed.
            source = Source.Source(file);
            //console.log("Analyse: \"" + Path.basename(file) + "\"");
            var compiler = findCompiler(source.file());
            source.compiler = compiler;

            try {
                compiler.analyse(source);
                sources[file] = {
                    file: file,
                    source: source,
                    compiler: compiler,
                    incomingEdges: [],
                    outgoingEdges: [],
                    index: index++
                };
                source.forEachNeed(add);
                source.forEachInclude(
                    function(f) {
                        add(f);
                        sources[file].outgoingEdges.push(f);
                    }
                );
            }
            catch (e) {
                console.error(
                    "\n################################################################################".err()
                );
                if (e.fatal) {
                    console.error(e.fatal.err());
                    console.error("".err());
                }
                throw e;
            }
        }
    }

    // ============================================================
    // Second step:
    // Topological sort.
    // ------------------------------------------------------------

    // Adding needs without making circular links.
    for (file in sources) {
        source = sources[file];
        source.source.forEachNeed(
            function(f) {
                var s = sources[f];
                if (s && source.index < s.index) {
                    source.outgoingEdges.push(f);
                }
            }
        );
    }

    // Figuring out incoming edges.
    for (file in sources) {
        source = sources[file];
        source.outgoingEdges.forEach(
            function(f) {
                sources[f].incomingEdges.push(file);
            }
        );
    }

    var sortedSources = [];
    var rootSources = [];  // Sources with no incoming edges.
    for (file in sources) {
        source = sources[file];
        if (source.incomingEdges.length == 0) {
            rootSources.push(source);
        }
    }

    while (rootSources.length > 0) {
        source = rootSources.pop();
        sortedSources.push(source);
        source.outgoingEdges.forEach(
            function(targetFile) {
                // Removing incoming edge from target.
                var target = sources[targetFile];
                var incomingEdges = target.incomingEdges;
                var i;
                for (i = 0 ; i < incomingEdges.length ; i++) {
                    if (source.file == incomingEdges[i]) {
                        incomingEdges.splice(i, 1);
                        break;
                    }
                }
                if (incomingEdges.length == 0) {
                    rootSources.push(target);
                }
            }
        );
    }

    // ============================================================
    // Third step:
    // Build in order.
    // ------------------------------------------------------------
    while (sortedSources.length > 0) {
        source = sortedSources.pop().source;
        if (source.compiler && source.compiler.compile) {
            try {
                source.compiler.compile(source);
            }
            catch (e) {
                throw e;
                //throw("ERROR building " + source.filename() + "\n" + e);
            }

        }
    }
};


/**
 * Copy the content of "www/" to another directory. Usually, a web server root.
 */
exports.deploy = function(target, options) {
    if (typeof options === 'undefined') {
        options = {
            exclude: ["/@"]
        };
    }
    Kernel.copy(Kernel.wwwPath(), target);
};

/**
 * Copy a part of the "src/" to the "www/".
 */
exports.publish = function(source, options) {
    Kernel.copy(
        Kernel.srcPath(source),
        Kernel.wwwPath(source)
    );
};
