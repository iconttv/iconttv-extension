'use strict';

const PREFIX = '[iconttv]';

const Logger = {
  debug: console.debug.bind(null, PREFIX),
  log: console.log.bind(null, PREFIX),
  warn: console.warn.bind(null, PREFIX),
  error: console.error.bind(null, PREFIX),
  trace: console.trace.bind(null, PREFIX),
  time: console.time,
  timeEnd: console.timeEnd,
  timeLog: (label?: string) => console.timeLog.apply(null, [label, PREFIX]),
  group: console.group.bind(null, PREFIX),
};

export default Logger;
