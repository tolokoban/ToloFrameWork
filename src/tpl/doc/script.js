var nav, body;

function tag(name, attribs) {
    if (typeof name === 'undefined') name = 'div';

    var e = document.createElement(name);
    if (typeof attribs === 'object') {
        var key, val;
        for (key in attribs) {
            val = attribs[key];
            e.setAttribute(key, val);
        }
    }
    return e;
}

function expand(caption, content) {
    var e = tag("div", {"class": "expand"});
    e.appendChild(caption);
    e.appendChild(content);
    caption.addEventListener(
        "click",
        function() {
            e.classList.toggle("show");
        },
        false
    );
    return e;
}

function h1(content) {
    var e = document.createElement("h1");
    e.textContent = content;
    return e;
}

function h2(content) {
    var e = document.createElement("h2");
    e.textContent = content;
    return e;
}

function h3(content) {
    var e = document.createElement("h3");
    e.textContent = content;
    return e;
}

function h4(content) {
    var e = document.createElement("h4");
    e.textContent = content;
    return e;
}

function h5(content) {
    var e = document.createElement("h5");
    e.textContent = content;
    return e;
}

function docRoot(x) {
    var e = tag();
    if (x.value) {
        switch (x.value.TYPE) {
            case "Function":
            case "Class":
                e.appendChild(docFunction(x));
                break;
        }
    }
    return e;
}

function getArgs(x) {
    var title = "( ";
    if (Array.isArray(x.args)) {
        x.args.forEach(
            function(arg, idx) {
                if (idx > 0) {
                    title += ", ";
                }
                title += arg;
            }
        );
    }
    title += " )";
    return title;
}

function docFunction(x) {
    var e = tag();
    console.info("[docFunction] x=...", x);
    var title = x.value.TYPE + " " + getArgs(x.value);
    e.appendChild(h4(title));
    e.appendChild(docComments(x.comments));
    e.appendChild(docComments(x.value.comments));
    var f = x.value;
    ["Methods", "Statics"].forEach(
        function(caption) {
            var items = f[caption.toLowerCase()];
            if (typeof items === 'object') {
                var name, item;
                for (name in items) {
                    item = items[name];
                    var div = tag();
                    div.className = caption;
                    var typ = tag("span");
                    typ.textContent = caption;
                    div.appendChild(typ);
                    var tail = tag("span");
                    tail.textContent = "  " + name + " " + getArgs(item);
                    div.appendChild(typ);
                    div.appendChild(tail);
                    e.appendChild(expand(div, docComments(item.comments)));
                }
            }
        }
    );

    return e;
}

function docComments(comments) {
    var e = tag("span");
    if (typeof comments !== 'object') return e;
    e.innerHTML = comments.$summary || "";
    if (Array.isArray(comments.$param)) {
        e.appendChild(h5("Arguments"));
        var ul = tag("ul", {"class": "param"});
        e.appendChild(ul);
        comments.$param.forEach(
            function(param) {
                var li = tag("li");
                var caption = tag("span");
                ul.appendChild(li);
                var paramName = tag("span", {"class": "name"});
                paramName.textContent = param.name;
                caption.appendChild(paramName);
                var paramType = tag("span", {"class": "type"});
                paramType.textContent = param.type;
                caption.appendChild(paramType);
                var content = tag("span");
                content.innerHTML = param.content;
                var n = content.textContent.length;
                if (n > 64) {
                    var summary = tag("span");
                    summary.textContent = content.textContent.substr(0, 64);
                    summary.className = "short inline";
                    caption.appendChild(summary);
                    li.appendChild(expand(caption, content));
                } else {
                    content.classList.add("inline");
                    caption.appendChild(content);
                    li.appendChild(caption);
                }
            }
        );

    }
    return e;
}

function showModule(name) {
    var key, val;
    body.innerHTML = "";
    var title = tag("h1");
    title.textContent = name;
    body.appendChild(title);
    var x = M[name].exports;
    console.info(name, x);
    body.appendChild(h2("module.exports"));
    if (x.TYPE == 'Object') {
        for (key in x.attributes) {
            val = x.attributes[key];
            console.info("[script] val=...", val);
            body.appendChild(h3(key));
            body.appendChild(docRoot(val));
        }
    } else {
        body.appendChild(docRoot(x));
    }
};

function init() {
    nav = document.getElementById("modules");
    body = document.getElementById("body");
    var name, e;
    for (name in M) {
        e = tag(
            "a",
            {
                href: "#",
                "data-name": name
            }
        );
        e.addEventListener(
            "click",
            function(evt) {
                showModule(evt.target.getAttribute("data-name"));
            },
            false
        );
        e.textContent = name;
        nav.appendChild(e);
    }

}
