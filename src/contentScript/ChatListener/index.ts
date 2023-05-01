import Logger from '../../Logger';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { ServerIconList } from '../../common/types';
import { getStreamerId } from '../utils/streamerId';
import { emptyServerIconList, getIconList } from '../server/api';
import TWITCH_SELECTORS from '../utils/selectors';
import { applyIconToElement } from './iconApply';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { icon2element } from './iconApply';
import { CLASSNAMES } from '../utils/classNames';

export const ChatListenerEventTypes = {
  CHANGE_URL: 'change_url',
  NEW_CHAT: 'new_chat',
};

class ChatListener extends SafeEventEmitter {
  static #instance: ChatListener;

  streamerId: string = '';

  constructor() {
    super();

    if (ChatListener.#instance) return ChatListener.#instance;
    ChatListener.#instance = this;

    this.on(ChatListenerEventTypes.CHANGE_URL, this.changeUrlHandler);
    this.on(ChatListenerEventTypes.NEW_CHAT, this.newChatHandler);
  }

  async changeUrlHandler(href: string) {
    const streamerId = getStreamerId(href);
    if (this.streamerId === streamerId) return;
    this.streamerId = streamerId;

    /** For debugging */
    if (this.streamerId === 'drowsyprobius') this.streamerId = 'funzinnu';

    try {
      let start = Date.now();
      const serverIconList = await getIconList(this.streamerId);
      start = Date.now();
      const keyword2icon = icon2element(serverIconList.icons);

      LocalStorage.cache.set(
        STORAGE_KEY.CACHE.SERVER_ICON_LIST,
        serverIconList
      );
      LocalStorage.cache.set(STORAGE_KEY.CACHE.KEYWORD2ICON, keyword2icon);
    } catch (e) {
      Logger.error(e);
      Logger.trace(e);
    }
  }

  async newChatHandler(element: Element) {
    if (element.matches(`.${CLASSNAMES.PROCESSED}`)) return;
    element.classList.add(CLASSNAMES.PROCESSED);

    const chatBody = element.querySelector(TWITCH_SELECTORS.chatBody);
    if (chatBody === null) return;

    // let start = Date.now();
    const convertedBody = await applyIconToElement(chatBody);
    chatBody.replaceWith(convertedBody);
    // Logger.debug(`icon replacement takes ${Date.now() - start} ms`);

    // TODO: chat scroll by one pic size
  }
}

export default new ChatListener();
