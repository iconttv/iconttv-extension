import Logger from '../Logger';
import TWITCH_SELECTORS from './utils/selectors';
import Observer from './Observer';
import ChatListener, { ChatListenerEventTypes } from './ChatListener';

class Iconttv {
  static #instance: Iconttv;
  currentHref = '';

  constructor() {
    if (Iconttv.#instance) return Iconttv.#instance;
    Iconttv.#instance = this;

    this.currentHref = window.location.href;
    ChatListener.emit(ChatListenerEventTypes.CHANGE_URL, this.currentHref);

    /** Observer 설정 */
    Observer.on(TWITCH_SELECTORS.chatLineMessage, (node) => {
      ChatListener.emit(ChatListenerEventTypes.NEW_CHAT, node);
    });

    Observer.on(TWITCH_SELECTORS.documentTitle, () => {
      if (this.currentHref === location.href) return;
      this.currentHref = location.href;
      ChatListener.emit(ChatListenerEventTypes.CHANGE_URL, this.currentHref);
    });

    Logger.log('loaded');
  }
}

export default Iconttv;
