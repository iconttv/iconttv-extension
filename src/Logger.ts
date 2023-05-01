'use strict';

const PREFIX = '[iconttv]';

const Logger = {
  debug(...args: any) {
    console.debug(PREFIX, ...args);
  },

  log(...args: any) {
    console.log(PREFIX, ...args);
  },

  warn(...args: any) {
    console.warn(PREFIX, ...args);
  },

  error(...args: any) {
    console.error(PREFIX, ...args);
  },

  trace(...args: any) {
    console.trace(PREFIX, ...args);
  },
}

export default Logger;

// const originalConsole = console;

// if (console) {
//   console = {
//     ...console,

//     debug(...args: any) {
//       originalConsole.debug(PREFIX, ...args);
//     },

//     log(...args: any) {
//       originalConsole.log(PREFIX, ...args);
//     },

//     warn(...args: any) {
//       originalConsole.warn(PREFIX, ...args);
//     },

//     error(...args: any) {
//       originalConsole.error(PREFIX, ...args);
//     },

//     trace(...args: any) {
//       originalConsole.trace(PREFIX, ...args);
//     },
//   };
// }
