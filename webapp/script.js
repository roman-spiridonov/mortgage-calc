/* global Navigator */
"use strict";

$(function () {
  var mainNavigator = new Navigator($(".content").first());
  mainNavigator.addRoute($(".nav__description"), "templates/description.html");
  mainNavigator.addRoute($(".nav__calculator"), "templates/calculator.html");
  mainNavigator.activate("#calculator");
});