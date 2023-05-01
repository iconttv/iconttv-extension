'use strict';

import Logger from '../Logger';
import Browser = require('webextension-polyfill');

Browser.runtime.onInstalled.addListener(async () => {
  Logger.log('on installed');
});

Browser.runtime.onStartup.addListener(() => {
  Logger.log('on startup hello again!');
});
