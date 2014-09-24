/**
 * @created 15/05/2014
 *
 */
window["TFW::wtag.Page"] = {
    superclass: "wtag.Tag",
    singleton: true,
    init: function() {
        this._lastPage = null;
        this._currentPage = null;
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
    },
    functions: {
        /**
         * Retouner un objet de la classe "tfw.CssAnim".
         */
        anim: function(keyframes) {
            return $$(
                "tfw.CssAnim",
                {keyframes: keyframes}
            );
        },

        /**
         *
         */
        build: function(element) {
            var tbl = $div(),
            header = $div(),
            body = $div(),
            footer = $div(),
            hasHeader = false,
            hasFooter = false,
            i, child, div;
            if (element.hasAttribute("id")) {
                var id = element.getAttribute("id");
                this._currentPage = element;
                if (this._lastPage) {
                    $addClass(this._lastPage, "hidden");
                }
                this._lastPage = element;
            } else {
                console.error("<w-page> needs an 'id'!", element);
            }
            for (i = 0 ; i < element.childNodes.length ; i++) {
                child = element.childNodes[i];
                if (child.nodeType != 1) continue;
                if (child.nodeName.toUpperCase() == "HEADER") {
                    hasHeader = true;
                    header.appendChild(child);
                }
                else if (child.nodeName.toUpperCase() == "FOOTER") {
                    hasFooter = true;
                    footer.appendChild(child);
                }
                else {
                    body.appendChild(child);
                }
            }
            if (hasHeader) {
                div = $div();
                tbl.appendChild(div);
                div.appendChild(header);
                $addClass(header, "header");
            }
            div = $div();
            tbl.appendChild(div);
            div.appendChild(body);
            $addClass(body, "body");
            if (hasFooter) {
                div = $div();
                tbl.appendChild(div);
                div.appendChild(footer);
                $addClass(footer, "footer");
            }
            $addClass(tbl, "tbl");
            element.appendChild(tbl);
        },

        /**
         * Aller vers la page dont on passe l'id en argument.
         */
        go: function(dstId) {
            var src = this._lastPage,
            dst = document.getElementById(dstId),
            anim;
            if (src) {
                anim = this._anims.toLeft;
                anim.apply(src);
                if (src.hasAttribute("data-hide")) {
                    $$.App.signal(src.getAttribute("data-hide"), {target: src});
                }
            }
            if (dst) {
                if (dst.hasAttribute("data-show")) {
                    $$.App.signal(dst.getAttribute("data-show"), {target: dst});
                }
                $removeClass(dst, "hidden");
                anim = this._anims.fromRight;
                anim.apply(dst);
                this._lastPage = dst;
            }
        }
    }
};
