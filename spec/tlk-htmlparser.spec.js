var Parser = require("../lib/tlk-htmlparser");
var Tree = require("../lib/htmltree");

describe('htmlparser', function () {
    function check(content, result) {
        expect(Parser.parse(content)).toEqual(result);
    }
    it('should deal with simple text', function () {
        check(
            'Hello world!',
            {children:[{type: Tree.TEXT, text: 'Hello world!'}]}
        );
    });
    it('should deal with simple text with HTML entities', function () {
        check(
            'a&lt;b',
            {children:[
                {type: Tree.TEXT, text: 'a'},
                {type: Tree.ENTITY, text: '&lt;'},
                {type: Tree.TEXT, text: 'b'}
            ]}
        );
    });
    it('should deal with simple text with HTML entities and spaces', function () {
        check(
            'a &lt; b',
            {children:[
                {type: Tree.TEXT, text: 'a '},
                {type: Tree.ENTITY, text: '&lt;'},
                {type: Tree.TEXT, text: ' b'}
            ]}
        );
    });
    it('should deal with ampercents', function () {
        check(
            'a&b',
            {children:[
                {type: Tree.TEXT, text: 'a&b'}
            ]}
        );
    });
    it('should deal with simple void elements', function () {
        check(
            '<br>',
            {children:[
                {type: Tree.TAG, name: 'br', attribs: {}, void: true}
            ]}
        );
    });
    it('should deal with simple autoclose elements', function () {
        check(
            '<$number/>',
            {children:[
                {type: Tree.TAG, name: 'number', attribs: {}, autoclose: true}
            ]}
        );
    });
});
