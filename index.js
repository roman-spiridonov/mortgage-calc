/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 7/15/2017.
 */
const gulp = require('gulp');

require('gulpfile');

module.exports = function run(task) {
  gulp.start(task || 'default');
};
