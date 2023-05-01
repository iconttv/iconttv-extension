'use strict';

import '../Logger';
import Browser = require('webextension-polyfill');

Browser.runtime.onInstalled.addListener(async () => {
  console.log('on installed');
});

Browser.runtime.onStartup.addListener(() => {
  console.log('on startup hello again!');
});
