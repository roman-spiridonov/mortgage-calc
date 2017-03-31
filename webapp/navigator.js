"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var Navigator = function () {
  function Navigator($contentEl) {
    var nav = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    this.$_contentEl = $contentEl;
    this._nav = nav; // {1: {trigger: $trigger1, href: "#page1", pageUrl: 'templates/page1.hml', isLoaded: false}, 2: { ... }, ... }
    this._count = nav.length || 0;
    this._active = null; // active trigger
  }

  Navigator.prototype.activate = function () {
    if (this._count <= 0) {
      console.error("Add at least one trigger to Navigator before setting it to active.");
    }

    var _parseArgument = this._parseArgument(arguments[0]),
        _parseArgument2 = _slicedToArray(_parseArgument, 4),
        id = _parseArgument2[0],
        href = _parseArgument2[1],
        pageUrl = _parseArgument2[2],
        isFound = _parseArgument2[3];

    if (isFound) {
      this._nav[id].trigger.trigger("click");
      this._nav[id].trigger.addClass("active");
    } else {
      console.error("The element " + arguments[0] + " was not found");
    }
    this._active = id;
  };

  Navigator.prototype.addRoute = function ($trigger, href, pageUrl, onLoaded) {
    var _this = this,
        _arguments = arguments;

    if (arguments[1].slice(0, 1) !== '#') {
      pageUrl = arguments[1];
      onLoaded = arguments[2] || function () {
        return false;
      };
      href = $('[href]', $trigger).attr('href');
    }

    var id = this._count++;
    this._nav[id] = { trigger: $trigger, href: href, pageUrl: pageUrl, isLoaded: false };

    $trigger.click(function () {
      if (_this._active !== null) {
        _this._nav[_this._active].trigger.toggleClass('active');
        $(_this._nav[_this._active].href, _this.$_contentEl).hide();
      }

      if (!_this._nav[id].isLoaded) {
        _this.$_contentEl.append("<div id=\"" + href.slice(1) + "\"></div>");
        $(href, _this.$_contentEl).load(pageUrl, function (response, status, xhr) {
          onLoaded.apply(_this, _arguments);
          if (status === "error") {
            console.error(xhr.status + " " + xhr.statusText);
          }
        });
      } else {
        // HTML was already loaded
        $(href, _this.$_contentEl).show();
      }

      _this._active = id;
      _this._nav[id].isLoaded = true;
      $trigger.addClass('active');
      return false;
    });

    $trigger.on("remove", function () {
      _this.removeRoute(id);
    });
  };

  Navigator.prototype.removeRoute = function () {
    var _parseArgument3 = this._parseArgument(arguments[0]),
        _parseArgument4 = _slicedToArray(_parseArgument3, 4),
        id = _parseArgument4[0],
        href = _parseArgument4[1],
        pageUrl = _parseArgument4[2],
        isFound = _parseArgument4[3];

    if (isFound) {
      this._nav[id].trigger.off();
      if (id === this._active) {
        this._nav[id].trigger.removeClass('active');
        this._active = null;
      }
      delete this._nav[id];
      this._count--;
    } else {
      console.error("The element " + arguments[0] + " was not found");
    }
  };

  Navigator.prototype._parseArgument = function (arg) {
    var id = void 0,
        href = void 0,
        pageUrl = void 0,
        isFound = false;

    if (typeof arg === "number") {
      // id
      id = arguments[0];
      if (id in this._nav) {
        href = this._nav[id].href;
        pageUrl = this._nav[id].pageUrl;
        isFound = true;
      }
    } else if (typeof arg === "string" && arguments[0].slice(0, 1) === '#') {
      // href
      href = arguments[0];
      for (var key in this._nav) {
        if (this._nav[key].href === href) {
          id = key;
          pageUrl = this._nav[key].pageUrl;
          isFound = true;
          break;
        }
      }
    } else if (typeof arg === "string") {
      // pageUrl
      pageUrl = arguments[0];
      for (var _key in this._nav) {
        if (encodeURIComponent(this._nav[_key][pageUrl]) === encodeURIComponent(pageUrl)) {
          id = _key;
          href = this._nav[_key].href;
          isFound = true;
          break;
        }
      }
    }

    return [id, href, pageUrl, isFound];
  };

  return Navigator;
}();