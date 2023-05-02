import Logger from '../../Logger';
import { Icon, IconSize, Keyword2Icon } from '../../common/types';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { CLASSNAMES } from '../utils/classNames';
import TWITCH_SELECTORS from '../utils/selectors';
import { escapeHTMLTags, replaceStyleTags } from './tagsApply';
import { matchIconElement } from './iconSearch';
import tippy from 'tippy.js';
import { getIconUrl } from '../server/api';
import ChatInputListener from '../ChatInputListener';

const MAGIC_CHAR = '~';

/**
 * 미리 keyword -> icon element 매핑 생성하기 위한 함수
 *
 * @param icons
 * @returns
 */
export function icon2element(icons: Icon[]): Keyword2Icon {
  const keyword2icon: Keyword2Icon = {};

  for (const icon of icons) {
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

    const thumbnailImage = iconImage.cloneNode(true) as HTMLImageElement;
    thumbnailImage.src = getIconUrl(icon.uri ?? icon.thumbnailUri);
    thumbnailImage.classList.add(CLASSNAMES.ICON.SMALL);
    thumbnailImage.onmouseover = function () {
      tippy(thumbnailImage, {
        hideOnClick: true,
        placement: 'top-start',
        theme: 'twitch',
      }).show();
    };
    thumbnailImage.onmouseout = function () {
      (thumbnailImage as any)._tippy &&
        (thumbnailImage as any)._tippy.destroy();
    };

    icon.keywords.forEach((keyword) => {
      keyword2icon[keyword] = {
        iconImage: iconImage,
        thumbnailImage: thumbnailImage,
      };
    });
  }

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
 * @param element TWITCH_SELECTORS.chatBody
 * @param options
 * @returns
 */
export async function applyIconToElement(element: Element): Promise<Element> {
  const convertedChildren: Element[] = [];

  for (const child of element.children) {
    if (child.matches(TWITCH_SELECTORS.chatText)) {
      const converted = await replaceTextToElements(child);
      convertedChildren.push(...converted);
    } else {
      convertedChildren.push(child);
    }
  }

  element.replaceChildren(...convertedChildren);
  return element;
}

/**
 *
 * @param chatTextSpan TWITCH_SELECTORS.chatText
 * @returns
 */
export async function replaceTextToElements(
  chatTextSpan: Element
): Promise<Element[]> {
  const innerText = chatTextSpan.textContent?.trim();
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
          /**
           * 공백으로 구분된 것만 아이콘으로 변환하는 이유는
           * 계산 효율성 때문
           *
           * BridgeBBCC에서는 icon.keywords에 있는 목록에서부터
           * 부분 문자열 탐색하므로 오래걸릴 듯
           */
          const textContent = childElement.textContent;
          if (textContent === null) {
            children.push(childElement);
            continue;
          }

          const tokens = textContent.trim().split(' ');
          let tokenStartIndex = 0,
            tokenIndex = 0;
          for (; tokenIndex < tokens.length; tokenIndex++) {
            const token = tokens[tokenIndex];
            if (isReplaced || !token.startsWith(MAGIC_CHAR)) continue;

            const keyword = token.slice(MAGIC_CHAR.length);
            const icon = matchIconElement(keyword);
            if (!icon) continue;

            /** 매치되는 아이콘 존재 */

            /**
             * 아이콘 이전까지의 token을 종합해서
             * 하나의 text-fragment로 생성
             */
            if (
              tokens.slice(tokenStartIndex, tokenIndex).join(' ').length > 0
            ) {
              children.push(
                elementWrapper(
                  tokens.slice(tokenStartIndex, tokenIndex).join(' '),
                  'text'
                )
              );
            }

            tokenStartIndex = tokenIndex + 1;

            const image = icon.iconImage.cloneNode(true) as HTMLImageElement;
            image.onclick = function (event) {
              ChatInputListener.setInputValue(
                (event?.target as HTMLImageElement).alt,
                true
              );
            };
            image.onmouseover = function () {
              tippy(image, {
                hideOnClick: true,
                placement: 'top-end',
                theme: 'twitch',
              }).show();
            };
            image.onmouseout = function () {
              (image as any)._tippy && (image as any)._tippy.destroy();
            };
            image.onload = function () {
              const scrollBar = document.querySelector(
                TWITCH_SELECTORS.chatScroll
              );
              if (!scrollBar) return;
              const scrollDiff =
                scrollBar.scrollHeight -
                scrollBar.scrollTop -
                scrollBar.clientHeight;
              const iconHeight = (this as HTMLImageElement).height ?? 0;
              Logger.log(scrollDiff, iconHeight);
              if (scrollDiff <= iconHeight) {
                scrollBar.scrollTop += iconHeight;
              }
            };

            if (iconSizeOption !== 'small') isReplaced = true;
            children.push(elementWrapper(image, iconSizeOption));
          }

          const leftover = tokens.slice(tokenStartIndex, tokenIndex).join(' ');
          if (tokenStartIndex < tokenIndex && leftover.length > 0) {
            children.push(elementWrapper(leftover, 'text'));
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
