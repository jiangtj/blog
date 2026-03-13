'use strict';

const hexo = require('eslint-config-hexo/eslint');

module.exports = [
  ...hexo,
  {
    rules: {
      'linebreak-style': 'off'
    }
  }
];
