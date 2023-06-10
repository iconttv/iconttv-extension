import Logger from '../../Logger';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { getStreamerId } from '../utils/streamerId';
import { getIconList } from '../server/api';
import TWITCH_SELECTORS from '../utils/selectors';
import { waitFor } from '../utils/elements';
import { replaceTextToElements } from './iconApply';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { icon2element } from './iconApply';
import { CLASSNAMES } from '../utils/classNames';
import { mountIconSelector, unmountIconSelector } from '../components/IconSelector';
import DOMObserver from '../Observer/DOM';

const DEVELOPERS = ['drowsyprobius'];

export const ChatListenerEventTypes = {
  CHANGE_STREAMER_ID: 'change_streamerId',
  NEW_CHAT: 'new_chat',
  CHAT_MOUNT: 'chat_mount',
};

class ChatListener extends SafeEventEmitter {
  static #instance: ChatListener;

  streamerId: string = '';
  status!: 'loading' | 'enabled' | 'disabled';

  constructor() {
    super();

    if (ChatListener.#instance) return ChatListener.#instance;
    ChatListener.#instance = this;

    this.status = 'loading';

    this.on(
      ChatListenerEventTypes.CHANGE_STREAMER_ID,
      this.changeStreamerIdHandler
    );
    this.on(ChatListenerEventTypes.CHAT_MOUNT, this.chatMountHandler);
    this.on(ChatListenerEventTypes.NEW_CHAT, this.newChatHandler);
  }

  async changeStreamerIdHandler() {
    this.status = 'loading';
    let streamerId = getStreamerId(window.location.href);
    // if (streamerId === '')
    //   streamerId = ChatInputListener.getStreamerName();

    /** For debugging */
    if (DEVELOPERS.includes(streamerId)) streamerId = 'funzinnu';

    if (this.streamerId === streamerId) return;
    this.streamerId = streamerId;

    Logger.debug(`Current Watching Streamer: ${this.streamerId}`);

    try {
      const serverIconList = await getIconList(this.streamerId);
      const keyword2icon = await icon2element(serverIconList.icons);

      Logger.debug(`Processing ${this.streamerId}'s icons...`);

      LocalStorage.cache.set(
        STORAGE_KEY.CACHE.SERVER_ICON_LIST,
        serverIconList
      );
      LocalStorage.cache.set(STORAGE_KEY.CACHE.KEYWORD2ICON, keyword2icon);
      LocalStorage.cache.set(
        STORAGE_KEY.CACHE.KEYWORDS,
        Object.keys(keyword2icon).sort((a, b) => b.length - a.length)
      );

      this.status = 'enabled';
      DOMObserver.activate();
      /** 선택기를 위해서 입력 감시 설정 */
    } catch (e) {
      this.status = 'disabled'
      DOMObserver.deactivate();
      unmountIconSelector();
      Logger.debug(`${this.streamerId}'s icon does not exists.`);
    }
  }

  async chatMountHandler() {
    if (this.status !== 'enabled') return;

    const iconSelectorParent = await waitFor(() =>
      document.querySelector(TWITCH_SELECTORS.iconSelectorParent)
    );
    if (iconSelectorParent) mountIconSelector(iconSelectorParent);
  }

  async newChatHandler(messageBody: Element) {
    if (messageBody.matches(`.${CLASSNAMES.PROCESSED}`)) return;
    messageBody.classList.add(CLASSNAMES.PROCESSED);

    Array.from(messageBody.children).forEach((chatFragment) => {
      if (
        !chatFragment.matches(TWITCH_SELECTORS.chatText) ||
        chatFragment.matches(TWITCH_SELECTORS.chatThirdPartyEmote)
      )
        return;

      chatFragment.replaceWith(...replaceTextToElements(chatFragment));
    });
  }
}

export default new ChatListener();
