import Logger from '../../Logger';
import type { Icon, IconSize, Keyword2Icon } from '../../common/types';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { CLASSNAMES } from '../utils/classNames';
import { escapeHTMLTags, replaceStyleTags } from './tagsApply';
import { getIconUrl } from '../server/api';
import { addTippyTo, destroyTippyFrom } from '../utils/elements';
import ChatInputListener from '../ChatInputListener';

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
      for (const keyword of icon.keywords) {
        keyword2icon[keyword.toLowerCase()] = iconImage;
      }

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
  originTextNode: Element,
  type: ElementWarpperType
): Element {
  const parent = document.createElement(originTextNode.tagName);
  for (const attribute of originTextNode.attributes) {
    parent.setAttribute(attribute.name, attribute.value);
  }
  parent.append(element);

  switch (type) {
    case 'text': {
      break;
    }
    // 이미지인 경우 크기 조절 필요하므로 클래스리스트 초기화
    case 'small': {
      parent.className = '';
      (element as Element).classList.add(CLASSNAMES.ICON.SMALL);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
    case 'medium': {
      parent.className = '';
      (element as Element).classList.add(CLASSNAMES.ICON.MEDIUM);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
    case 'large': {
      parent.className = '';
      (element as Element).classList.add(CLASSNAMES.ICON.LARGE);
      parent.classList.add(CLASSNAMES.NEWLINE);
      break;
    }
  }

  return parent;
}

/**
 *
 * for twitch
 * ```
 * <span class="text-fragment" data-a-target="chat-message-text">ㅁㄴㅇㄻㄴㄹㅇ</span>
 * ```
 *
 * for chzzk
 * ```
 * <span class="live_chatting_message_text__DyleH" style="color: rgb(217, 176, 79);">~롱파누</span>
 * ```
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
    // 요소 렌더링하기 위한 임시 요소
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
              image.onclick = (event) => {
                event.stopPropagation();
                ChatInputListener.appendInputValue(
                  (event?.target as HTMLImageElement).alt,
                  true
                );
              };
              image.onmouseover = () => {
                addTippyTo(image, { placement: 'top-start' });
              };
              image.onmouseout = () => {
                destroyTippyFrom(image);
              };
              image.onload = () => {
                /**
                 * 사용자가 의도적으로 스크롤을
                 * 올린 경우가 아니면
                 *
                 * 이미지 크기만큼 스크롤 내리기
                 */

                const scrollBar = document.querySelector(
                  window.iconttv.domSelector.chatScrollableContainer
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

              children.push(elementWrapper(prev, chatTextSpan, 'text'));
              children.push(
                elementWrapper(image, chatTextSpan, iconSizeOption)
              );
              children.push(elementWrapper(rest, chatTextSpan, 'text'));

              // if (iconSizeOption !== 'small')
              isReplaced = true;
              break;
            }
          }

          /** 변환된 아이콘이 없으면 기존 텍스트 그대로 반환 */
          if (!isReplaced) {
            children.push(elementWrapper(textContent, chatTextSpan, 'text'));
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
