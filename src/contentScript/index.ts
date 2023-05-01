'use strict';

import Iconttv from './Iconttv';
import './style.css';

(async (window) => {
  if (
    ![
      'www.twitch.tv',
      'clips.twitch.tv',
      'embed.twitch.tv',
      'dashboard.twitch.tv',
    ].includes(window.location.hostname)
  )
    return;
  if (window.frameElement !== null) return;
  if (window.__iconttv) return;
  window.__iconttv = true;
  window.iconttv = new Iconttv();
})(window);
