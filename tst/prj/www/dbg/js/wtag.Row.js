/**
 * @created 15/05/2014
 *
 */
window["TFW::wtag.Row"] = {
    superclass: "wtag.Tag",
    singleton: true,
    functions: {
	/**
         *
         */
        build: function(element) {
            var tbl = $div(), child, i, j, children = [],
            row = $div(), cell, pad = 4,
            align, alignRoot = "",
            nbCols = 0,
            nbRows = 1,
            count = 0,
            array = [],
            idxRow, idxCol,
            width = 100;
            $copyAttribs(element, tbl);
            if (element.hasAttribute("data-pad")) {
                pad = parseFloat(element.getAttribute("data-pad"));
            }
            if (element.hasAttribute("data-align")) {
                alignRoot = element.getAttribute("data-align");
            }
            alignRoot = this.parseAlign(alignRoot);
            tbl.className = element.className || "";
            $addClass(tbl, "wtag-row");
            for (i = 0 ; i < element.childNodes.length ; i++) {
                child = element.childNodes[i];
                if (child.nodeType == 1) {
                    if (child.nodeName.toUpperCase() == "BR") {
                        // Passer à la ligne suivante.
                        children.push(array);
                        nbRows++;
                        nbCols = Math.max(count, nbCols);
                        array = [];
                        count = 0;
                    } else {
                        array.push(child);
                        count++;
                    }
                }
            }
            children.push(array);
            nbRows++;
            nbCols = Math.max(count, nbCols);
            width = Math.floor(100 * (100 / nbCols)) / 100;
            for (idxRow = 0 ; idxRow < children.length ; idxRow++) {
                array = children[idxRow];
                for (idxCol = 0 ; idxCol < array.length ; idxCol++) {
                    child = array[idxCol];
                    cell = $div();
                    cell.style.padding = (pad / 2) + "vm";
                    cell.style.padding = (pad / 2) + "vmin";
                    if (idxCol == 0) {
                        cell.style.paddingLeft = pad + "vmin";
                    }
                    if (idxCol == nbCols - 1) {
                        cell.style.paddingRight = pad + "vmin";
                    }
                    if (idxRow == 0) {
                        cell.style.paddingTop = pad + "vmin";
                    }
                    if (idxRow == nbRows - 1) {
                        cell.style.paddingBottom = pad + "vmin";
                    }
                    cell.style.width = width + "%";
                    cell.appendChild(child);
                    row.appendChild(cell);
                    if (child.hasAttribute("data--align")) {
                        align = this.parseAlign(child.getAttribute("data--align"));
                    } else {
                        align = alignRoot;
                    }
                    if (align.R && align.L) {
                        // Etendre horizontallement.
                        child.style.width = "100%";
                    }
                    else if (align.R) {
                        cell.style.textAlign = "right";
                    }
                    else if (align.L) {
                        cell.style.textAlign = "left";
                    }
                    if (align.T && align.B) {
                        // Etirer verticallement.
                        child.style.height = "100%";
                    }
                    else if (align.T) {
                        cell.style.verticalAlign = "top";
                    }
                    else if (align.B) {
                        cell.style.verticalAlign = "bottom";
                    }
                }
                // Passer à la ligne suivante.
                tbl.appendChild(row);
                row = $div();
            }
            tbl.appendChild(row);
            $replace(element, tbl);
        },

        /**
         * Transforme  une chaîne  de  caractères  en dictionnaire  pour
         * faciliter l'analyse des "align".
         */
        parseAlign: function(align) {
            var dic = {},
            i;
            align = align.toUpperCase();
            for (i = 0 ; i < align.length ; i++) {
                dic[align.charAt(i)] = 1;
            }
            return dic;
        }
    }
};
