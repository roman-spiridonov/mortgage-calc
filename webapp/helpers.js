"use strict";

(function () {
  var qs = function qs(s) {
    return document.body.querySelector(s);
  }; // shortcut for querySelector
  window.qs = qs;
})();