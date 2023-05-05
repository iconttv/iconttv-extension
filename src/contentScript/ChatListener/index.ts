import Logger from '../../Logger';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { ServerIconList } from '../../common/types';
import { getStreamerId } from '../utils/streamerId';
import { emptyServerIconList, getIconList } from '../server/api';
import TWITCH_SELECTORS, { waitFor } from '../utils/selectors';
import { applyIconToElement } from './iconApply';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { icon2element } from './iconApply';
import { CLASSNAMES } from '../utils/classNames';
import ChatInputListener from '../ChatInputListener';
import { injectIconSelector } from '../components/IconSelector';

export const ChatListenerEventTypes = {
  CHANGE_STREAMER_ID: 'change_streamerId',
  NEW_CHAT: 'new_chat',
};

class ChatListener extends SafeEventEmitter {
  static #instance: ChatListener;

  streamerId: string = '';

  constructor() {
    super();

    if (ChatListener.#instance) return ChatListener.#instance;
    ChatListener.#instance = this;

    this.on(
      ChatListenerEventTypes.CHANGE_STREAMER_ID,
      this.changeStreamerIdHandler
    );
    this.on(ChatListenerEventTypes.NEW_CHAT, this.newChatHandler);
  }

  async changeStreamerIdHandler() {
    let streamerId = getStreamerId(window.location.href);
    // if (streamerId === '')
    //   streamerId = ChatInputListener.getStreamerName();

    /** For debugging */
    if (streamerId === 'drowsyprobius') streamerId = 'funzinnu';

    if (this.streamerId === streamerId) return;
    this.streamerId = streamerId;

    Logger.debug(`Current Watching Streamer: ${this.streamerId}`);

    try {
      const serverIconList = await getIconList(this.streamerId);
      const keyword2icon = icon2element(serverIconList.icons);

      Logger.debug(`Processing ${this.streamerId}'s icons...`);

      LocalStorage.cache.set(
        STORAGE_KEY.CACHE.SERVER_ICON_LIST,
        serverIconList
      );
      LocalStorage.cache.set(STORAGE_KEY.CACHE.KEYWORD2ICON, keyword2icon);

      /** 선택기를 위해서 입력 감시 설정 */
      const iconSelectorParent = await waitFor(() =>
        document.querySelector(TWITCH_SELECTORS.chatInputEditor)
      );
      if (iconSelectorParent) injectIconSelector(iconSelectorParent);
    } catch (e) {
      Logger.debug(`${this.streamerId}'s icon does not exists.`);
      // Logger.debug(e);
    }
  }

  async newChatHandler(element: Element) {
    if (element.matches(`.${CLASSNAMES.PROCESSED}`)) return;
    element.classList.add(CLASSNAMES.PROCESSED);

    const chatBody = await waitFor(
      () => element.querySelector(TWITCH_SELECTORS.chatBody),
      1000
    );
    if (chatBody === null) return;

    // let start = Date.now();
    const convertedBody = await applyIconToElement(chatBody);
    chatBody.replaceWith(convertedBody);
    // Logger.debug(`icon replacement takes ${Date.now() - start} ms`);
  }
}

export default new ChatListener();
