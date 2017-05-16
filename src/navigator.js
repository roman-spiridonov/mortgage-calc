"use strict";

module.exports = Navigator;

function Navigator($contentEl, nav = []) {
  this.$_contentEl = $contentEl;
  this._nav = nav; // {1: {trigger: $trigger1, href: "#page1", pageUrl: 'fragments/page1.hml', isLoaded: false}, 2: { ... }, ... }
  this._count = nav.length || 0;
  this._active = null; // active trigger
}

const _p = Navigator.prototype;

_p.activate = function () {
  if (this._count <= 0) {
    console.error("Add at least one trigger to Navigator before setting it to active.");
  }

  let [id, href, pageUrl, isFound] = this._parseArgument(arguments[0]);
  if (isFound) {
    this._nav[id].trigger.trigger("click");
    this._nav[id].trigger.addClass("active");
  } else {
    console.error(`The element ${arguments[0]} was not found`);
  }
  this._active = id;
};


_p.addRoute = function ($trigger, href, pageUrl, onLoaded) {
  if (arguments[1].slice(0, 1) !== '#') {
    pageUrl = arguments[1];
    onLoaded = arguments[2] || (() => false);
    href = $('[href]', $trigger).attr('href');
  }

  let id = this._count++;
  this._nav[id] = {trigger: $trigger, href: href, pageUrl: pageUrl, isLoaded: false};

  $trigger.click(() => this._onClick.call(this, id, $trigger, onLoaded));
  $trigger.on("remove", () => this._onRemove.call(this, id));
};

_p._onClick = function (arg0, $trigger, cb) {
  let [id] = this._parseArgument(arg0);

  if (this._active !== null) {
    this._nav[this._active].trigger.toggleClass('active');
    $(this._nav[this._active].href, this.$_contentEl).hide();
  }

  this._load(id, (id) => {
    this._nav[id].isLoaded = true;
  });

  this._active = id;
  $trigger.addClass('active');
  cb.call(this, id);
  return false;
};

_p._onRemove = function (arg0) {
  let [id] = this._parseArgument(arg0);
  this.removeRoute(id);
};

/**
 * Loads the fragment.
 */
_p._load = function (arg0, cb) {
  let [id, href, pageUrl, isFound] = this._parseArgument(arg0);

  if (isFound) {
    if (!this._nav[id].isLoaded) {
      let $contentDiv = $(`<div id="${href.slice(1)}"></div>`);
      this.$_contentEl.append($contentDiv);
      let contents = this._getInlineFragment(id);
      if (!contents) {
        $(href, this.$_contentEl).load(pageUrl, (response, status, xhr) => {
          if (status === "error") {
            console.error(xhr.status + " " + xhr.statusText);
          }
          cb.call(this, id);
        });
      } else {
        $contentDiv.html(contents);
      }
    } else { // HTML was already loaded
      $(href, this.$_contentEl).show();
    }
  } else {
    console.error(`The element ${arguments[0]} was not found`);
  }
  cb.call(this, id);
};


/**
 * Retrieve fragment stored in <script type="text/template">
 * @returns {string|null}
 * @private
 */
_p._getInlineFragment = function () {
  let [id, href, pageUrl, isFound] = this._parseArgument(arguments[0]);
  if (isFound) {
    let cache = $(`script${href}`).html();
    return cache;
  } else {
    return null;
  }
};


_p.removeRoute = function () {
  let [id, href, pageUrl, isFound] = this._parseArgument(arguments[0]);
  if (isFound) {
    this._nav[id].trigger.off();
    if (id === this._active) {
      this._nav[id].trigger.removeClass('active');
      this._active = null;
    }
    delete this._nav[id];
    this._count--;
  } else {
    console.error(`The element ${arguments[0]} was not found`);
  }
};

_p._parseArgument = function (arg) {
  let id, href, pageUrl,
    isFound = false;

  if (typeof(arg) === "number") { // id
    id = arguments[0];
    if (id in this._nav) {
      href = this._nav[id].href;
      pageUrl = this._nav[id].pageUrl;
      isFound = true;
    }

  } else if (typeof(arg) === "string" && arguments[0].slice(0, 1) === '#') { // href
    href = arguments[0];
    for (let key in this._nav) {
      if (this._nav[key].href === href) {
        id = key;
        pageUrl = this._nav[key].pageUrl;
        isFound = true;
        break;
      }
    }

  } else if (typeof(arg) === "string") { // pageUrl
    pageUrl = arguments[0];
    for (let key in this._nav) {
      if (encodeURIComponent(this._nav[key][pageUrl]) === encodeURIComponent(pageUrl)) {
        id = key;
        href = this._nav[key].href;
        isFound = true;
        break;
      }
    }
  }

  return [id, href, pageUrl, isFound];
};
