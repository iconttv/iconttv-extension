import Logger from '../../Logger';
import { Icon, IconSize, Keyword2Icon } from '../../common/types';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { CLASSNAMES } from '../utils/classNames';
import TWITCH_SELECTORS from '../utils/selectors';
import { escapeHTMLTags, replaceStyleTags } from './tagsApply';
import { getIconUrl } from '../server/api';
import ChatInputListener from '../ChatInputListener';
import { addTippyTo, destroyTippyFrom } from '../utils/elements';

export const MAGIC_CHAR = '~';

/**
 * 미리 keyword -> icon element 매핑 생성하기 위한 함수
 *
 * @param icons
 * @returns
 */
export async function icon2element(icons: Icon[]): Promise<Keyword2Icon> {
  const keyword2icon: Keyword2Icon = {};

  const iconImages: Promise<HTMLImageElement>[] = icons.map((icon) => {
    return new Promise((resolve) => {
      const iconImage = document.createElement('img');
      iconImage.src = getIconUrl(icon.uri);
      iconImage.alt = `~${icon.keywords[0]}`;
      iconImage.classList.add(CLASSNAMES.ICONTTV, CLASSNAMES.ICON.COMMON);
      iconImage.height = 0;
      iconImage.onerror = function () {
        this.onerror = null;
        this.src = icon.originUri;
      };
      iconImage.setAttribute('data-uri', getIconUrl(icon.uri));
      iconImage.setAttribute('data-hash', icon.nameHash);
      iconImage.setAttribute('data-name', icon.name);
      iconImage.setAttribute('data-keywords', icon.keywords.join(','));
      iconImage.setAttribute('data-tags', icon.tags.join(','));
      iconImage.setAttribute('data-tippy-content', `~${icon.keywords[0]}`);
      iconImage.loading = 'lazy';
      /**
       * 채팅창 렌더링 되는 이미지는 추가될 때
       * tippy 설정
       */
      icon.keywords.forEach((keyword) => {
        keyword2icon[keyword.toLowerCase()] = iconImage;
      });

      resolve(iconImage);
    });
  });

  await Promise.all(iconImages);
  return keyword2icon;
}

type ElementWarpperType = 'text' | IconSize;
/**
 *
 * @param element text or icon element
 * @param type
 * @returns div or span element
 */
function elementWrapper(
  element: Element | string,
  type: ElementWarpperType
): Element {
  const parent = document.createElement(type === 'text' ? 'span' : 'div');
  parent.append(element);

  switch (type) {
    case 'text': {
      parent.classList.add('text-fragment');
      parent.setAttribute('data-a-target', 'chat-message-text');
      break;
    }
    case 'small': {
      (element as Element).classList.add(CLASSNAMES.ICON.SMALL);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
    case 'medium': {
      (element as Element).classList.add(CLASSNAMES.ICON.MEDIUM);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
    case 'large': {
      (element as Element).classList.add(CLASSNAMES.ICON.LARGE);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
  }

  return parent;
}

/**
 *
 * @param chatTextSpan TWITCH_SELECTORS.chatText
 * @returns
 */
export function replaceTextToElements(chatTextSpan: Element): Element[] {
  const innerText = chatTextSpan.textContent;
  if (innerText === null || innerText === undefined || innerText.length === 0)
    return [chatTextSpan];

  function replaceTags(html: string, iconSizeOption: IconSize): Element[] {
    let isReplaced = false; // 최대 하나만 렌더링 하기
    const container = document.createElement('div');
    const children: Element[] = [];
    container.innerHTML = html;

    for (const child of container.childNodes) {
      const childElement = child as Element;

      switch (childElement.nodeType) {
        case Node.TEXT_NODE: {
          const textContent = childElement.textContent;
          if (textContent === null) {
            children.push(childElement);
            continue;
          }

          const keywords = LocalStorage.cache.get(
            STORAGE_KEY.CACHE.KEYWORDS
          ) as string[];
          const keyword2icon = LocalStorage.cache.get(
            STORAGE_KEY.CACHE.KEYWORD2ICON
          ) as Keyword2Icon;
          /** 효율성 문제 있을까? */

          for (
            let startIdx = 0;
            !isReplaced && startIdx < textContent.length;
            startIdx++
          ) {
            if (textContent[startIdx] !== MAGIC_CHAR) continue;
            const restContent = textContent.slice(startIdx);

            for (const rawKeyword of keywords) {
              const keyword = `~${rawKeyword}`;
              if (!restContent.startsWith(keyword)) continue;

              const prev = textContent.slice(0, startIdx);
              const rest = textContent.slice(startIdx + keyword.length);
              const icon = keyword2icon[rawKeyword];

              const image = icon.cloneNode() as HTMLImageElement;
              image.onclick = function (event) {
                ChatInputListener.appendInputValue(
                  (event?.target as HTMLImageElement).alt,
                  true
                );
              };
              image.onmouseover = function () {
                addTippyTo(image, { placement: 'top-start' });
              };
              image.onmouseout = function () {
                destroyTippyFrom(image);
              };
              image.onload = function () {
                /**
                 * 사용자가 의도적으로 스크롤을
                 * 올린 경우가 아니면
                 *
                 * 이미지 크기만큼 스크롤 내리기
                 */

                const scrollBar = document.querySelector(
                  TWITCH_SELECTORS.chatScroll
                );

                if (!scrollBar) return;

                const scrollDiff =
                  scrollBar.scrollHeight -
                  scrollBar.scrollTop -
                  scrollBar.clientHeight;

                if (scrollDiff <= image.height * 2) {
                  scrollBar.scrollTop += image.height * 2;
                }
              };

              children.push(elementWrapper(prev, 'text'));
              children.push(elementWrapper(image, iconSizeOption));
              children.push(elementWrapper(rest, 'text'));

              // if (iconSizeOption !== 'small')
              isReplaced = true;
              break;
            }
          }

          /** 변환된 아이콘이 없으면 기존 텍스트 그대로 반환 */
          if (!isReplaced) {
            children.push(elementWrapper(textContent, 'text'));
          }

          break;
        }

        default: {
          const replacedChildren = replaceTags(
            childElement.innerHTML,
            iconSizeOption
          );
          childElement.replaceChildren(...replacedChildren);
          children.push(childElement);
        }
      }
    }

    return children;
  }

  try {
    const replaceTagOption = LocalStorage.browser.get(
      STORAGE_KEY.BROWSER.REPLACE_TAG
    ) as boolean;
    const iconSizeOption = LocalStorage.browser.get(
      STORAGE_KEY.BROWSER.ICON_SIZE
    ) as IconSize;

    return replaceTagOption
      ? replaceTags(replaceStyleTags(escapeHTMLTags(innerText)), iconSizeOption)
      : replaceTags(escapeHTMLTags(innerText), iconSizeOption);
  } catch (error) {
    Logger.error(error);
    Logger.trace(error);
    return [chatTextSpan];
  }
}
