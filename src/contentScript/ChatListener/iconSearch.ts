import {
  Icon,
  IconElement,
  Keyword2Icon,
  ServerIconList,
} from '../../common/types';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';

/**
 * 아이콘
 *
 * @param icons 검색할 icon 목록
 * @param keyword icon keyword without magic character `~`
 * @returns keyword가 포함된 모든 아이콘 목록 리턴
 */
export function searchIcon(keyword: string, includeTags = true) {
  keyword = keyword.toLowerCase();

  const icons: Icon[] = (
    LocalStorage.cache.get(STORAGE_KEY.CACHE.SERVER_ICON_LIST) as ServerIconList
  ).icons;

  const result: Icon[] = [];
  for (const icon of icons) {
    let match = false;
    // 키워드 검색
    const keywords = icon.keywords.map((k) => k.toLowerCase());
    for (const key of keywords) {
      if (key.indexOf(keyword) !== -1) {
        result.push(icon);
        match = true;
        break;
      }
    }

    // 태그검색
    if (includeTags) {
      if (match) continue;
      const tags = icon.tags.map((t) => t.toLowerCase());
      for (const tag of tags) {
        if (tag.indexOf(keyword) !== -1) {
          result.push(icon);
          break;
        }
      }
    }
  }

  return result;
}

/**
 *
 * @param keyword 검색할 키워드 (~ 제외)
 * @returns idx or -1
 */
export function matchIconElement(keyword: string): IconElement | void {
  keyword = keyword.toLowerCase();

  const keyword2icon = LocalStorage.cache.get(
    STORAGE_KEY.CACHE.KEYWORD2ICON
  ) as Keyword2Icon;

  if (keyword in keyword2icon) return keyword2icon[keyword];
  return;
}
