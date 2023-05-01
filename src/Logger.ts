'use strict';

const PREFIX = '[iconttv]';

const Logger = {
  debug: console.debug.bind(null, PREFIX),
  log: console.debug.bind(null, PREFIX),
  warn: console.debug.bind(null, PREFIX),
  error: console.debug.bind(null, PREFIX),
  trace: console.debug.bind(null, PREFIX),
};

export default Logger;
