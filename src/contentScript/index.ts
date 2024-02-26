'use strict';

import Iconttv from './Iconttv';
import { CHZZK_SELECTOR } from './constants/selector/chzzk';
import { TWITCH_SELECTOR } from './constants/selector/twitch';

import './styles/index.css';
import './styles/tippy.css';

const isTwitch = () => {
  return [
    'www.twitch.tv',
    'clips.twitch.tv',
    'embed.twitch.tv',
    'dashboard.twitch.tv',
  ].includes(window.location.hostname);
};

const isChzzk = () => {
  return ['chzzk.naver.com'].includes(window.location.hostname);
};

(async (window) => {
  if (!(isTwitch() || isChzzk())) return;
  if (window.frameElement !== null) return;
  if (window.__iconttv) return;

  window.__iconttv = true;
  if (isTwitch()) {
    new Iconttv(TWITCH_SELECTOR, 'twitch');
  } else if (isChzzk()) {
    new Iconttv(CHZZK_SELECTOR, 'chzzk');
  }
})(window);
