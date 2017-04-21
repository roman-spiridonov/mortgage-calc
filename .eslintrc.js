module.exports = {
  "env": {
    "commonjs": true,
    "node": true,
    "es6": true,
    "mocha": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "$": true,
    "_": true,
    "chrome": true,
    "google": true,
    "qs": true,
  },

  "rules": {
    "no-console": 0,
    "strict": 1,
    "no-unused-vars": 1,
    "no-cond-assign": 0
  }
};