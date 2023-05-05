import Logger from '../Logger';
import TWITCH_SELECTORS from './utils/selectors';
import Observer from './Observer';
import ChatListener, { ChatListenerEventTypes } from './ChatListener';
import { injectSettings } from './components/Settings';

class Iconttv {
  static #instance: Iconttv;

  constructor() {
    if (Iconttv.#instance) return Iconttv.#instance;
    Iconttv.#instance = this;

    ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);

    /** Observer 설정 */
    Observer.on(TWITCH_SELECTORS.chatLineMessage, (node) => {
      ChatListener.emit(ChatListenerEventTypes.NEW_CHAT, node);
    });

    Observer.on(TWITCH_SELECTORS.chatInputEditor, () => {
      ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);
    });

    Observer.on(TWITCH_SELECTORS.chatSettingContainer, (node) => {
      injectSettings(node as Element);
    });

    Logger.log('loaded');
  }
}

export default Iconttv;
