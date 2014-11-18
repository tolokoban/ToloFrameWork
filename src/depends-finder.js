var DependsFinder = function(code) {
    this.code = code;
    this.index = 0;
    this.depends = [];
    this.parse();
};

DependsFinder.prototype.addDep = function(dep) {
    if (this.depends.indexOf(dep) < 0) {
        this.depends.push(dep);
        return true;
    }
    return false;
};

DependsFinder.prototype.parse = function() {
    var good = false;
    while (this.index < this.code.length) {
        var c = this.code.charAt(this.index);
        if (c == '"' || c == "'") {
            this.parseString();
        }
        else if (c == 'r') {
            good = true;
            if (this.index > 0) {
                good = false;
                c = this.code.charAt(this.index - 1);
                if (c != '.' && c != '$' && c != '_' && (c < 'a' || c > 'z')
                    && (c < 'A' || c > 'Z') && (c < '0' || c > '9')) {
                    good = true;
                }
            }
            if (good && this.code.substr(this.index, 8) == 'require(') {
                this.index += 8;
                c = this.code.charAt(this.index);
                if (c == '"' || c == "'") {
                    this.addDep("require.js");
                    this.addDep("mod/" + this.parseString() + ".js");
                }
            }
        }
        else if (c == '$') {
            good = true;
            if (this.index > 0) {
                good = false;
                c = this.code.charAt(this.index - 1);
                if (c != '.' && c != '$' && c != '_' && (c < 'a' || c > 'z')
                    && (c < 'A' || c > 'Z') && (c < '0' || c > '9')) {
                    good = true;
                }
            }
            if (good && this.code.substr(this.index, 3) == '$$(') {
                this.index += 3;
                c = this.code.charAt(this.index);
                if (c == '"' || c == "'") {
                    this.addDep("tfw3.js");
                    this.addDep("cls/" + this.parseString() + ".js");
                }
            }
        }
        this.index++;
    }
};

DependsFinder.prototype.parseString = function() {
    var quote = this.code.charAt(this.index);
    this.index++;
    var begin = this.index;
    var esc = false;
    while (this.index < this.code.length) {
        var c = this.code.charAt(this.index);
        if (esc) {
            esc = false;
        } else {
            if (c == '\\') {
                esc = true;
            }
            else if (c == quote) {
                this.index++;
                return this.code.substr(begin, this.index - begin - 1);
            }
        }
        this.index++;
    }
    return "";
};


module.exports = DependsFinder;
