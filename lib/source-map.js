/**
 * Here are some example of numbers encoded in VLQ64.
 *   13 -> 1101 
 *      -> positive, we add a trailing 0
 *      -> 11010 = 26
 *      -> "a"
 * -6   -> -110
 *      -> negative, we add a trailing 1
 *      -> 1101 = 13
 *      -> "N"
 * 1974 -> 11110110110
 *      -> positive, we add a trailing 0
 *      -> 111101101100
 *      -> too big for Base64, cut it in chunks of 5
 *      -> 00011 11011 01100
 *      -> reverse order
 *      -> 01100 11011 00011
 *      -> add continuation bits (1 for all except the last)
 *      -> 101100 111011 000011
 *      ->   44     59      3
 *      -> "s7D"
 */


// Base64 alphabet taken from
// [wikipedia](https://en.wikipedia.org/wiki/Base64#Variants_summary_table)
var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


/**
 * Read a Base64 encoded line with  `;` and `,` separators as integral
 * numbers between -3 and 63.
 */
var LineParser = function(line) {
    this._line = line;
    this._cursor = 0;
};

/**
 * @return Next Base64 value or :
 * * -1: for `,`.
 * * -2: for `;`.
 * * -3: unexpected char.
 */
LineParser.prototype.next = function() {
    while (true) {
        var c = this._line.charAt(this._cursor);
        this._cursor++;
        if (c == ',') return -1;
        if (c == ';') return -2;
        // Ignore blank chars.
        if (c <= ' ') continue;
        var v = BASE64.indexOf(c);
        if (v < 0) return -3;
        return v;
    }
};

/**
 * @return Next number 
 */
LineParser.prototype.nextNumber = function(n) {
    var continuationBit = n & 32;
    var signBit = n & 1;
    var shift = 5;
    var v;
    // Remove continuation bit (the left most).
    n = n & 31;
    while (continuationBit) {
        v = this.next();
        if (v < 0) {
            throw "[SourceMap] Unexpected char after a continuation bit in position " + this._cursor;
        }
        n += v << shift;
        shift += 5;
        continuationBit = v & 32;
    }
    if (n & 1) {
        return -(n >> 1);
    }
    return n >> 1;
};

/**
 * @return `true` if there are chars  to parse, and `false` if we have
 * reached the end of the line.
 */
LineParser.prototype.hasMoreChars = function() {
    return this._cursor < this._line.length;
};

/**
 * @return Current cursor position. Used to report errors.
 */
LineParser.prototype.pos = function() {
    return this._cursor;
};

var SourceMap = function(sourcemap, generatedContent) {
    this.sourcemap(sourcemap);
    this.generatedContent(generatedContent);
};


/**
 * @return void
 */
SourceMap.prototype.generatedContent = function(generatedContent) {
    if (typeof generatedContent === 'undefined') return this._generatedContent;
    // Remove trailing spaces and new lines.
    generatedContent = generatedContent.trimRight();
    // Counting lines.
    var lines = 1;
    // Position of the last line in the generated content.
    var lastLinePos = 0;
    // Index in the content,
    var i;
    // Current char.
    var c;
    for (i = 0; i < generatedContent.length; i++) {
        c = generatedContent.charAt(i);
        if (c == "\n") {
            lines++;
            lastLinePos = i+1;
        }
    }
    // Remove the last comment for source-maps, if any.
    if (generatedContent.substr(lastLinePos, 3) === '//#') {
        generatedContent = generatedContent.substr(0, lastLinePos).trimRight();
    }
    this._generatedContent = generatedContent;
    this._generatedContentLinesCount = lines;
    return this;
};


/**
 * Getter/setter for the attribute `sourcemap`.
 */
SourceMap.prototype.sourcemap = function(v) {
    if (typeof v === 'undefined') return this._sourcemap;
    this._sourcemap = v;
    // Parsing.
    var parser = new LineParser(v.mappings);
    var lines = [];
    var line = [];
    var item = [];
    var accumulator = [0,0,0,0,0];
    var n;
    while (parser.hasMoreChars()) {
        n = parser.next();
        if (n == -3) {
            throw "[SourceMap] Bad char in `mappings` attribute at position " + parser.pos() + '!';
        }
        if (n == -1 || n == -2) {
            // Next item.
            line.push(item);
            item = [];
            if (n == -2) {
                // End of generated file's line.
                lines.push(line);
                line = [];
            }
        }
        else {
            accumulator[item.length] += parser.nextNumber(n);
            item.push(accumulator[item.length]);
        }
    }
    if (item.length > 0) line.push(item);
    if (line.length > 0) lines.push(line);
    this._lines = lines;
    return this;
};


/**
 * 
 * @return this
 */
SourceMap.prototype.append = function(srcMapToAppend) {
    if (typeof srcMapToAppend.append !== 'function') {
        throw "[SourceMap] `srcMapToAppend` must be an instance of the class SourceMap!";
    }

    var srcmap1 = this.sourcemap();
    var srcmap2 = srcMapToAppend.sourcemap();

    //-------------------------------------------------
    // Step 1: Compute shifts.
    var shiftSources = srcmap1.sources.length;
    var shiftNames = srcmap1.names.length;
    //-------------------------------------------------
    // Step 2: Add `sources`, `sourcesContent` and `names`.
    ['sources', 'sourcesContent', 'names'].forEach(function (attributeName) {
        srcmap2[attributeName].forEach(function (item) {
            srcmap1[attributeName].push(item);
        });
    });
    //-------------------------------------------------
    // Step 3: Append content.
    this.generatedContent(this.generatedContent() + "\n" + srcMapToAppend.generatedContent());
    //-------------------------------------------------
    // Step 4: Add `mappings` while adding shifts.
    srcMapToAppend._lines.forEach(function (lineToAppend) {
        var currentLine = [];
        lineToAppend.forEach(function (itemToAppend) {
            // This is the structure of an item (all values are absolute) :
            // [generated column, original file index, orig. line, orig. column, name index]
            var item = itemToAppend.slice();  // Clone it.
            // `item` length can be 1, 4 or 5.
            if (item.length > 1) {
                item[1] += shiftSources;  // Original file index.
                if (item.length > 4) {
                    item[4] += shiftNames;
                }
            }
            currentLine.push(item);
        });
        this._lines.push(currentLine);
    });
    //--------------------------------------------------
    // Step 5: Compact `_lines` into `mappings` according to VLQ64.
    var mappings = '';
    var absoluteItem = [0,0,0,0,0];
    this._lines.forEach(function (line) {
        if (mappings != '') {
            // New line is marked with a `;`.
            mappings += ';';
        }
        // Flag used to add a `,` between segments.
        var firstItem = true;
        line.forEach(function (segment) {
            if (firstItem) {
                firstItem = false;
            } else {
                mappings += ',';
            }
            segment.forEach(function (value) {
                // `low` is used  to cut a big number in  chuncks of 5
                // bits.
                var low;
                // Convert value into VLQ64.
                if (value == 0) {
                    // Special case of zero.
                    mappings += "A";
                    return;
                }
                if (value < 0) {
                    // Negative value: add a tailing 1.
                    value = ((-value) << 1) | 1;
                } else {
                    // Positive value: add a tailing 0.
                    value = value << 1;
                }
                while (value > 0) {
                    low = value & 31;
                    value = (value - low) >> 5;
                    if (value > 0) {
                        // Add continuation bit.
                        low |= 32;
                    }
                    mappings += BASE64.charAt(low);
                }
            });
        });
    });
    return this;
};

module.exports = SourceMap;
