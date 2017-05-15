/* global Navigator */
"use strict";

$(function() {
  let mainNavigator = new Navigator($(".content").first());
  mainNavigator.addRoute($(".nav__description"), "fragments/description.html");
  mainNavigator.addRoute($(".nav__calculator"), "fragments/calculator.html");
  mainNavigator.activate("#calculator");
});
