var Util = require("../../lib/wdg/util.js");

function assertTokenize(cases) {
    cases.forEach(
        function(item) {
            var result = Util.tokenize(item[0]);
            this.assert(item[1], result);
        },
        this
    );
}

function assertParse(cases) {
    cases.forEach(
        function(item) {
            var result = Util.parseBindingExpression(item[0]);
            this.assert(item[1], result);
        },
        this
    );
}

exports.tokenize_basic_expression = function() {
    assertTokenize.call(
        this,
        [
            ["variable", [["ID", "variable", 0], null]],
            ["-3.141592", [["NUMBER", "-3.141592", 0], null]],
            ["-.92", [["NUMBER", "-.92", 0], null]],
            [".0", [["NUMBER", ".0", 0], null]],
            ["0.92", [["NUMBER", "0.92", 0], null]],
            ["  foo     \n\t  ", [["ID", "foo", 2], null]],
            ["'hello'", [["STRING", "'hello'", 0], null]],
            ["'isn\\'t it?'", [["STRING", "'isn\\'t it?'", 0], null]],
            ['"hello"', [["STRING", '"hello"', 0], null]],
            ['"isn\\"t it?"', [["STRING", '"isn\\\"t it?"', 0], null]]
        ]
    );
};

exports.tokenize_complex_expression = function() {
    assertTokenize.call(
        this,
        [
            [
                "3 + 4 / 8",
                [["NUMBER","3",0],["OP","+",2],["NUMBER","4",4],["OP","/",6],["NUMBER","8",8],null]
            ],
            [
                "3 * 4 - 8",
                [["NUMBER","3",0],["OP","+",2],["NUMBER","4",4],["OP","/",6],["NUMBER","8",8],null]
            ],
            [
                "foo - bar * (85 % bib)",
                [["ID","foo",0],["OP","-",4],["ID","bar",6],["OP","*",10],["(","(",12],["NUMBER","85",13],["OP","%",16],["ID","bib",18],[")",")",21],null]
            ],
            [
                "foo % (bar + 7) ? bib : -1",
                [["ID","foo",0],["OP","%",4],["(","(",6],["ID","bar",7],["OP","+",11],["NUMBER","7",13],[")",")",14],["IF","?",16],["ID","bib",18],["ELSE",":",22],["NUMBER","-1",24],null]
            ],
            [
                "(width < 100) | (height >= 100)",
                [["(","(",0],["ID","width",1],["OP","<",7],["NUMBER","100",9],[")",")",12],["OP","|",14],["(","(",16],["ID","height",17],["OP",">=",24],["NUMBER","100",27],[")",")",30],null]
            ]
        ]
    );
}

exports.parse_simple_expression = function() {
    assertParse.call(
        this,
        [
            ["3+8*7", {"code":"ADD(3,MUL(8,7))","vars":[]}],
            ["3*8-7", {"code":"ADD(3,MUL(8,7))","vars":[]}]
        ]
    );
}