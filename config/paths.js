'use strict';

const path = require('path');

const srcPath = path.resolve(__dirname, '../src');

const PATHS = {
  src: {
    // popup: path.join(srcPath, 'popup'),
    contentScript: path.join(srcPath, 'contentScript'),
    background: path.join(srcPath, 'background'),
  },
  build: path.resolve(__dirname, '../build'),
};

module.exports = PATHS;
