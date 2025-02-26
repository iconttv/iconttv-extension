import type { Icon, ServerIconList } from '../../common/types';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';

/**
 * 아이콘
 *
 * @param icons 검색할 icon 목록
 * @param keyword icon keyword without magic character `~`
 * @returns keyword가 포함된 모든 아이콘 목록 리턴
 */
export function searchIcon(keyword: string, includeTags = true): number[] {
  const lowerKeyword = keyword.toLowerCase();

  const icons: Icon[] = (
    LocalStorage.cache.get(STORAGE_KEY.CACHE.SERVER_ICON_LIST) as ServerIconList
  ).icons;

  const result: number[] = [];
  icons.forEach((icon, idx) => {
    let match = false;
    // 키워드 검색
    const keywords = icon.keywords.map((k) => k.toLowerCase());
    for (const key of keywords) {
      if (key.indexOf(lowerKeyword) !== -1) {
        result.push(idx);
        match = true;
        break;
      }
    }

    // 태그검색
    if (includeTags) {
      if (match) return;
      const tags = icon.tags.map((t) => t.toLowerCase());
      for (const tag of tags) {
        if (tag.indexOf(lowerKeyword) !== -1) {
          result.push(idx);
          break;
        }
      }
    }
  });

  return result;
}
