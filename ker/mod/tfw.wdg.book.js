"use strict";

/**
 * @example
 * <div id="book-id">
 *   <div data-page="welcome">...</div>
 *   <div data-page="game">...</div>
 *   <div data-page="highscores">...</div>
 * </div>
 *
 * @example
 * var Book = require("tfw.wdg.book");
 * var book = new Book("book-id");
 * book.show("game");
 * @class Book
 */
var Book = function(book) {
  if (typeof book === 'string') {
    book = document.getElementById(book);
  }
  book.classList.add("custom");
  book.classList.add("tfw-wdg-book");
  book.classList.add("fullscreen");
  var i, child, id, pages = {}, current, count = 0;
  for (i = 0 ; i < book.childNodes.length ; i++) {
    child = book.childNodes[i];
    if (child.nodeType != 1) continue;
    id = child.getAttribute("data-page");
    if (id && id.length > 0) {
      child.classList.add("page");
      if (!child.getAttribute("data-index")) {
        child.setAttribute("data-index", count);
      } else {
        count = parseInt(child.getAttribute("data-index")) || 0;
      }
      pages[id] = child;
      if (!current) {
        current = child;
      } else {
        child.classList.add("hide");
      }
    } else {
      child.classList.add("overlay");
    }
    count++;
  }
  this._pages = pages;
  this._current = current;
  if (!current) {
    console.error("[tfw.wdg.book] Book without pages!");
    console.error("[tfw.wdg.book] Pages must have the \"data-page\" attribute!");
  }
};


/**
 * @return void
 */
Book.prototype.show = function(pageID) {
  var rect;
  var pages = this._pages;
  var page = pages[pageID];
  var current = this._current;
  var pageIdx = parseInt(page.getAttribute("data-index")) || 0;
  var currentIdx = parseInt(current.getAttribute("data-index")) || 0;
  if (!page || page == current) return;
  current.classList.remove("transition");
  current.classList.remove("right");
  current.classList.remove("hide");
  page.classList.remove("transition");
  page.classList.remove("right");
  page.classList.remove("hide");
  if (currentIdx < pageIdx) {
    page.classList.add("right");
    rect = page.getBoundingClientRect();
    current.classList.add("hide");
    page.classList.remove("right");
  } else {
    page.classList.add("hide");
    rect = page.getBoundingClientRect();
    current.classList.add("right");
    page.classList.remove("hide");
  }
  current.classList.add("transition");
  page.classList.add("transition");

  this._current = page;
};


Book.create = function(book) {
  return new Book(book);
};
module.exports = Book;
