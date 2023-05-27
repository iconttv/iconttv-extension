// import Browser from 'webextension-polyfill';
import {
  Icon,
  IconApplyOptions,
  IconSize,
  Keyword2Icon,
  ServerIconList,
} from '../common/types';
import { emptyServerIconList } from './server/api';

/**
 * 페이지 바뀌면 초기화되는
 * CacheStorage
 */
interface CacheStorage extends Record<string, any> {
  streamerId: string;
  chatInput: string;
  serverIconList: ServerIconList;
  keyword2icon: Keyword2Icon;
  keywords: string[];
}
type CacheStorageValue = string | string[] | ServerIconList | Keyword2Icon;

interface BrowserStorage extends Record<string, string | boolean | number> {
  replaceTag: boolean;
  iconSize: IconSize;
}
type BrowserStorageValue = string | boolean | number;

const defaultCacheStorage: CacheStorage = {
  streamerId: '',
  chatInput: '',
  serverIconList: emptyServerIconList,
  keyword2icon: {},
  keywords: [],
};
const defaultBrowserStorage: string = JSON.stringify({
  replaceTag: true,
  iconSize: 'medium',
});

export const STORAGE_KEY = {
  CACHE: {
    STREAMER_ID: 'streamerId',
    CHAT_INPUT: 'chatInput',
    SERVER_ICON_LIST: 'serverIconList',
    KEYWORD2ICON: 'keyword2icon',
    KEYWORDS: 'keywords',
  },
  BROWSER: {
    REPLACE_TAG: 'replaceTag',
    ICON_SIZE: 'iconSize',
  },
} as const;

class LocalStorage {
  static #instance: LocalStorage;

  private browserStorage!: Storage;
  private cacheStorage!: CacheStorage;

  browserKey = 'iconttv';
  browser!: {
    get: (key: keyof BrowserStorage) => BrowserStorageValue | void;
    set: (
      key: keyof BrowserStorage,
      value: BrowserStorageValue
    ) => BrowserStorageValue;
  };

  cache!: {
    get: (key: keyof CacheStorage) => CacheStorageValue | void;
    set: (
      key: keyof CacheStorage,
      value: CacheStorageValue
    ) => CacheStorageValue;
  };

  constructor() {
    if (LocalStorage.#instance) return LocalStorage.#instance;
    LocalStorage.#instance = this;

    this.setDefaultStorage();

    this.browser = {
      get: (key) => {
        const storage = JSON.parse(
          this.browserStorage[this.browserKey] || '{}'
        );
        if (key in storage) return storage[key];
        return;
      },

      set: (key, value) => {
        const storage = JSON.parse(
          this.browserStorage[this.browserKey] || '{}'
        );
        storage[key] = value;
        this.browserStorage[this.browserKey] = JSON.stringify(storage);
        return value;
      },
    };

    this.cache = {
      get: (key) => {
        if (key in this.cacheStorage) return this.cacheStorage[key];
        return;
      },

      set: (key, value) => {
        this.cacheStorage[key] = value;
        return value;
      },
    };
  }

  setDefaultStorage() {
    this.browser;
    this.cacheStorage = defaultCacheStorage;

    this.browserStorage = window.localStorage ?? this.cacheStorage;
    if (!this.browserStorage[this.browserKey]) {
      this.browserStorage[this.browserKey] = defaultBrowserStorage;
    }
  }

  isExpired(key: string) {
    /** 캐시에 없으면 새로 고침해야하니 true */
    if (!(key in this.cache)) return true;
    return false;
  }
}

export default new LocalStorage();
