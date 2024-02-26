import Logger from '../Logger';
import DOMObserver from './Observer/DOM';
import URLObserver from './Observer/URL';
import ChatListener, { ChatListenerEventTypes } from './ChatListener';
import { mountSettings } from './components/Settings';
import { DOMSelector } from './constants/selector';

type StreamPlatform = 'twitch' | 'chzzk';

class Iconttv {
  domSelector: DOMSelector;
  streamPlatform: StreamPlatform;

  constructor(domSelector: DOMSelector, platform: StreamPlatform) {
    Logger.time('Iconttv Init');
    this.domSelector = domSelector;
    this.streamPlatform = platform;

    if (window.iconttv) {
      Logger.timeEnd('Iconttv Init');
      return window.iconttv;
    }
    window.iconttv = this;

    ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);

    /** Observer 설정 */
    URLObserver.on(() => {
      ChatListener.emit(ChatListenerEventTypes.CHANGE_STREAMER_ID);
    });

    DOMObserver.on(this.domSelector.chatBody, (node) => {
      ChatListener.emit(ChatListenerEventTypes.NEW_CHAT, node);
    });

    DOMObserver.on(this.domSelector.chatInputEditor, () => {
      ChatListener.emit(ChatListenerEventTypes.CHAT_MOUNT);
    });

    DOMObserver.on(this.domSelector.chatSettingContainer, (node: Element) => {
      mountSettings(node);
    });

    Logger.timeEnd('Iconttv Init');
  }
}

export default Iconttv;
