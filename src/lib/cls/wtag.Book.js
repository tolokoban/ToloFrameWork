/**
 * @created 12/08/2014
 *
 */
window["TFW::wtag.Book"] = {
    superclass: "WTag",
    attributes: {
        animDuration: .4,
        pages: {},
        data: null
    },
    init: function() {
        this._anims = {
            fromRight: this.anim(
                {
                    from: {transform: "translateX(100%)"},
                    to: {transform: "translateX(0%)"}
                }
            ),
            toRight: this.anim(
                {
                    from: {transform: "translateX(0%)"},
                    to: {transform: "translateX(100%)"}
                }
            ),
            fromLeft: this.anim(
                {
                    from: {transform: "translateX(-100%)"},
                    to: {transform: "translateX(0%)"}
                }
            ),
            toLeft: this.anim(
                {
                    from: {transform: "translateX(0%)"},
                    to: {transform: "translateX(-100%)"}
                }
            )
        };

        this._currentPage = null;
        var page, id;
        for (page in this._pages) {
            id = this._pages[page];
            this._pages[page] = document.getElementById(id);
        }

        var children = this._element.childNodes,
        i, item, name;
        for (i = 0 ; i < children.length ; i++) {
            item = children[i];
            item._index = i;
            $hide(item);
            if (i == 0) {
                this._currentPage = item;
            }
        }
        $show(this._currentPage);

        var that = this;
        this.registerSignal(
            "page",
            function(arg, signal, emitter) {
                return that.go(arg);
            }
        );
        var data = this._data;
        if (typeof data === 'string')  {
            this.bindData(data, "go");
        }
    },

    functions: {
        /**
         * Return an instance of "tfw.CssAnim".
         */
        anim: function(keyframes) {
            return $$(
                "tfw.CssAnim",
                {keyframes: keyframes}
            );
        },

        go: function(name) {
            var src = this._currentPage,
            dst = this._pages[name],
            anim;
            if (src === dst) return false;
            if (!dst) {
                // This  page does  not exist  in this  book: let  the
                // event be propagated up to its parents.
                return false;
            }
/*
            if (src.$widget) {
                src.$widget.slot("hide");
            }
            if (dst.$widget) {
                dst.$widget.slot("show");
            }
*/
            anim = src._index < dst._index ? this._anims.toLeft : this._anims.toRight;
            anim.apply(src, {duration: this._animDuration});
            anim = src._index < dst._index ? this._anims.fromRight : this._anims.fromLeft;
            anim.apply(dst, {duration: this._animDuration});
            $show(dst);
            this._currentPage = dst;
        }
    }
};
