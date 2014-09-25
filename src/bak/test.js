var Tpl = require("./template");

var text = "Hi {{Joe}} ! Who's {{Natacha}} ?";
console.log(text);
var replacer = function(name) {
    console.log("name: \"" + name + "\"");
    return "<data>" + name + "</data>";
};

var ctx = Tpl.text(text, replacer);
console.log(ctx.out);

ctx = Tpl.text(
    text, 
    {
        joe: "buddy",
        natacha: "that girl"
    }
);
console.log(ctx.out);
