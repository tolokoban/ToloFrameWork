"use strict";

/* exported CODE_BEHIND */
const CODE_BEHIND = {
    onIndexChange,
    onKeysChange,
    onItemsChange,
    onValueChange,
    onExpandedChange
};

const
    Dom = require( "dom" ),
    PM = require( "tfw.binding.property-manager" ),
    Touchable = require( "tfw.touchable" );

const
    ITEM_HEIGHT = 32;

/**
 * @this XJS
 * @param {Array} items - Array of items to display in the Combo
 * @return {undefined}
 */
function onItemsChange( items ) {
    const
        that = this,
        list = Dom( this.$elements.list );
    // button = Dom( this.$elements.button );
    Dom.clear( list );
    this._listHeight = 0;
    this._itemsDivs = [];

    items.forEach( function ( val ) {
        that._listHeight += ITEM_HEIGHT;
        const item = Dom.div( [ val ] );
        that._itemsDivs.push( item );
        Dom.add( list, item );
    } );

    if ( !this.index ) this.index = 0;
}

/**
 * @this ViewXJS
 * @param {DOMElement} item - DIV containing a clickable item.
 * @param {DOMElement} list - DIV container for items.
 * @param {integer} index - Index of the item.
 * @param {Touchable} button - Touchable behaviour for an item.
 * @returns {undefined}
 */
function expandList( item, list, index, button ) {
    const
        listContainer = this.$elements.listContainer,
        cssWidth = Dom( list ).clientWidth;
    Dom.css( listContainer, { width: `${cssWidth}px` } );
    Dom.detach( list );
    Dom.add( document.body, list );

    Dom.addClass( item, 'thm-bgSL' );
    const rect = button.getBoundingClientRect();
    let top = rect.top - ( ITEM_HEIGHT * index );
    const topLimit = top - ( ITEM_HEIGHT * Math.floor( top / ITEM_HEIGHT ) );
    if ( top < 0 ) top = topLimit;
    while ( top > topLimit && top + this._listHeight > document.body.clientHeight - 8 ) {
        top -= ITEM_HEIGHT;
    }
    top += ITEM_HEIGHT * index;

    Dom.css( list, {
        left: `${rect.left}px`,
        top: `${top}px`,
        height: "auto"
    } );
    const listWidth = list.getBoundingClientRect().width;
    Dom.css( button, { width: this.wide ? 'auto' : `${listWidth}px` } );
}

/**
 * For two items, we never show the whole list, but we just change the selection on click.
 * @this ViewXJS
 * @returns {boolean} `true` if there are at most 2 items.
 */
function manageIfFewItems() {
    const itemsCount = getLength.call( this, this.items );
    if ( itemsCount < 2 ) return true;
    if ( itemsCount === 2 ) {
        this.index = 1 - this.index;
        this.expanded = false;
        return true;
    }
    // More than 2 items to manage.
    return false;
}

/**
 * Current item can be set by key (string) or by index (number)-
 * @this ViewXJS
 * @param {integer} index - Index of the item to select.
 * @returns {undefined}
 */
function onIndexChange( index ) {
    if ( hasKeys.call( this ) ) {
        this.value = this.keys[ index ];
    } else {
        this.value = index;
    }
}

/**
 * @this ViewXJS
 * @returns {boolean} Have keys been defined?
 */
function hasKeys() {
    const keysCount = getLength.call( this, this.keys );
    if ( keysCount < 1 ) return false;
    return keysCount === getLength.call( this, this.items );
}

/**
 * @param {Array} arr - Array from which you want the length.
 * @returns {integer} The array's length or 0 if it is not an array.
 */
function getLength( arr ) {
    if ( !arr ) return 0;
    if ( !Array.isArray( arr ) ) return 0;
    return arr.length;
}

/**
 * @this ViewXJS
 * @param {Array} keys - The keys are not displayed. Thay are use to map a key to each item.
 * Without `keys`, we map the index for each item.
 * @returns {undefined}
 */
function onKeysChange() {
    if ( typeof this.index !== 'number' ) return;
    onIndexChange.call( this, this.index );
}

/**
 * @this ViewXJS
 * @param {string} value - What keys is currently selected.
 * @returns {undefined}
 */
function onValueChange( value ) {
    let index = 0;
    if ( hasKeys.call( this ) ) {
        index = this.keys.indexOf( value );
        if ( index < 0 ) index = 0;
        PM( this ).set( "index", index );
    } else {
        index = parseInt( value, 10 );
        if ( !isNaN( index ) && index >= 0 && index < getLength.call( this, this.items ) ) {
            PM( this ).set( "index", index );
        }
    }
    const list = Dom( this.$elements.list );
    Dom.css( list, {
        transform: `translateY(-${ITEM_HEIGHT * this.index}px)`,
        left: 0,
        top: 0,
        height: "auto"
    } );
}

/**
 * @this ViewXJS
 * @param {boolean} expanded - An expanded combo is when you see all the items at once for selection.
 * @returns {undefined}
 */
function onExpandedChange( expanded ) {
    if ( expanded ) expand.call( this );
    else collapse.call( this );
}

/**
 * @this ViewXJS
 * @returns {undefined}
 */
function expand() {
    if ( manageIfFewItems.call( this ) ) return;

    const
        screen = addScreen.call( this ),
        expandedList = copyContentOf.call( this );
    moveList( this.$elements.list.$, expandedList );
    Dom.add( screen, expandedList );
}

/**
 * Try to move `expandedList` to make the selected item be exactly above the same item in
 * `collapsedItem`. If it is not possible, a scroll bar will appear.
 * @param {DOMElement} collapsedList - DIV showing only one item bcause the rest is hidden.
 * @param {DOMElement} expandedList - DIV showing the most items as it can.
 * @returns {undefined}
 */
function moveList( collapsedList, expandedList ) {
    const
        rect = collapsedList.getBoundingClientRect(),
        left = rect.left;
    console.info( "rect=", rect );
    let top = rect.top;
    while ( top <= 0 ) top += ITEM_HEIGHT;
    Dom.css( expandedList, {
        left: `${left}px`,
        top: `${top}px`
    } );
}

/**
 * We sill copy the innerHTML of items and add a Touchable behaviour on each of them.
 * @this ViewXJS
 * @returns {DOMElement} DIV with all cloned items.
 */
function copyContentOf() {
    const
        that = this,
        items = this.items,
        div = Dom.div( "thm-ele8" );
    items.forEach( function ( item, index ) {
        const clonedItem = Dom.div( that.index === index ? "thm-bgSL" : "thm-bg3" );
        if ( typeof item === 'string' ) {
            clonedItem.textContent = item;
        } else {
            clonedItem.innerHTML = Dom( item ).innerHTML;
        }
        Dom.add( div, clonedItem );
        const touchable = new Touchable( clonedItem );
        touchable.tap.add( () => {
            that.expanded = false;
            that.index = index;
        } );
    } );
    return div;
}

/**
 * @this ViewXJS
 * @returns {undefined}
 */
function collapse() {
    removeScreen.call( this );

}

/**
 * @this ViewXJS
 * @returns {undefined}
 */
function removeScreen() {
    const screen = this._screen;

    if ( screen ) {
        Dom.detach( screen );
        delete this._screen;
    }
}

/**
 * @this ViewXJS
 * @returns {DOMElement} The screen DIV.
 */
function addScreen() {
    removeScreen.call( this );
    const
        that = this,
        screen = Dom.div( "tfw-view-combo-screen" );
    this._screen = screen;
    Dom.add( document.body, screen );
    Dom.on( screen, () => {
        that.expanded = false;
    } );
    return screen;
}

/**
if ( !expanded ) {
    this._itemsDivs.forEach( function ( itemDiv ) {
        Dom.removeClass( itemDiv, 'thm-bgSL' );
    } );
}
}
*/