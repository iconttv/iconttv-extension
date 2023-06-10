import Logger from '../Logger';
import TWITCH_SELECTORS from './utils/selectors';
import DOMObserver from './Observer/DOM';
import URLObserver from './Observer/URL';
import ChatListener, { ChatListenerEventTypes } from './ChatListener';
import { mountSettings } from './components/Settings';

class Iconttv {
  static #instance: Iconttv;

  constructor() {
    if (Iconttv.#instance) return Iconttv.#instance;
    Iconttv.#instance = this;

    ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);

    /** Observer 설정 */
    DOMObserver.on(TWITCH_SELECTORS.chatBody, (node) => {
      ChatListener.emit(ChatListenerEventTypes.NEW_CHAT, node);
    });

    URLObserver.on(() => {
      ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);
    });

    DOMObserver.on(TWITCH_SELECTORS.chatInputEditor, () => {
      ChatListener.emit(ChatListenerEventTypes.CHAT_MOUNT);
    });

    DOMObserver.on(TWITCH_SELECTORS.chatSettingContainer, (node: Element) => {
      mountSettings(node);
    });

    Logger.log('loaded');
  }
}

export default Iconttv;
