"use strict";

var Navigator = (function() {
  function Navigator($contentEl, nav = []) {
    this.$_contentEl = $contentEl;
    this._nav = nav; // {1: {trigger: $trigger1, href: "#page1", pageUrl: 'fragments/page1.hml', isLoaded: false}, 2: { ... }, ... }
    this._count = nav.length || 0;
    this._active = null; // active trigger
  }

  Navigator.prototype.activate = function() {
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


  Navigator.prototype.addRoute = function ($trigger, href, pageUrl, onLoaded) {
    if (arguments[1].slice(0, 1) !== '#') {
      pageUrl = arguments[1];
      onLoaded = arguments[2] || (() => false);
      href = $('[href]', $trigger).attr('href');
    }

    let id = this._count++;
    this._nav[id] = {trigger: $trigger, href: href, pageUrl: pageUrl, isLoaded: false};

    $trigger.click(() => {
      if (this._active !== null) {
        this._nav[this._active].trigger.toggleClass('active');
        $(this._nav[this._active].href, this.$_contentEl).hide();
      }

      if (!this._nav[id].isLoaded) {
        this.$_contentEl.append(`<div id="${href.slice(1)}"></div>`);
        $(href, this.$_contentEl).load(pageUrl, (response, status, xhr) => {
          onLoaded.apply(this, arguments);
          if (status === "error") {
            console.error(xhr.status + " " + xhr.statusText);
          }
        });
      } else { // HTML was already loaded
        $(href, this.$_contentEl).show();
      }

      this._active = id;
      this._nav[id].isLoaded = true;
      $trigger.addClass('active');
      return false;
    });

    $trigger.on("remove", () => {
      this.removeRoute(id);
    });

  };

  Navigator.prototype.removeRoute = function() {
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

  Navigator.prototype._parseArgument = function(arg) {
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

  return Navigator;

})();
