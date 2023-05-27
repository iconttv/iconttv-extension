'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src.popup,
      iconttv: PATHS.src.contentScript,
      background: PATHS.src.background,
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
