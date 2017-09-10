"use strict";

const $ = require('jquery');

const Navigator = require('./navigator');

$(function() {
  let mainNavigator = new Navigator($(".content").first());
  mainNavigator.addRoute($(".nav__description"), "fragments/description.html");
  mainNavigator.addRoute($(".nav__calculator"), "fragments/calculator.html");
  mainNavigator.activate("#calculator");
});
