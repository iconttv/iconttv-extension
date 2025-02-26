// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Stack } from '@mui/material';
import {
  addTippyTo,
  destroyTippyFrom,
  hideAllTippy,
  waitFor,
} from '../utils/elements';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import type { ServerIconList } from '../../common/types';
import { AppIconImage, getIconUrl } from '../server/api';
import { searchIcon } from '../ChatListener/iconSearch';
import { MAGIC_CHAR } from '../ChatListener/iconApply';

import '../styles/selector.css';
import ChatInputListener from '../ChatInputListener';

const ICONTTV_SELECTOR_ID = 'iconttv-selector-root';
const ICON_SELECTED_CLASSNAME = 'iconttv-item-selected';
const ICON_HIDE_CLASSNAME = 'iconttv-hide';
const ARROW_KEYS = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'];
const COMMAND_KEYS = ARROW_KEYS.concat('Tab');

function getNextCursor(current: number, max: number, offset: number): number {
  const next = current + offset;

  if (next < 0) return next + max;
  if (next >= max) return next - max;
  return next;
}

const IconSelector: React.FC = () => {
  const defaultIconList = (
    LocalStorage.cache.get(STORAGE_KEY.CACHE.SERVER_ICON_LIST) as ServerIconList
  ).icons;

  const listRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(-1);
  const chatInputRef = useRef<HTMLDivElement | null>(null);
  const isOpenRef = useRef(false);
  const chatInputTextRef = useRef<string | null>(null);
  const [activeIconIndexList, setActiveIconIndexList] = useState<number[]>(
    defaultIconList.map((_, i) => i)
  );

  const getActiveIconElements = () => {
    if (listRef.current === null) return [];
    return Array.from(listRef.current.children).filter(
      (element) => !element.classList.contains(ICON_HIDE_CLASSNAME)
    );
  };

  const getNumberOfColumns = () => {
    if (!listRef.current) return 0;
    /** firstElement로 하면 선택된 항목이 확대된 상태라 정확하지 않은 값 계산됨 */
    const lastElementChild = listRef.current.lastElementChild;
    if (lastElementChild === null) return 0;

    const iconStyle = window.getComputedStyle(lastElementChild);
    const listContainerWidth = listRef.current.offsetWidth;
    const iconWidth =
      Number.parseFloat(iconStyle.width) +
      Number.parseFloat(iconStyle.marginLeft) +
      Number.parseFloat(iconStyle.marginRight);

    return Math.floor(listContainerWidth / iconWidth);
  };

  const closeSelector = () => {
    if (!isOpenRef.current) return;

    if (listRef.current && cursorRef.current !== -1) {
      const children = Array.from(listRef.current.children).filter(
        (element) => !element.classList.contains(ICON_HIDE_CLASSNAME)
      );

      const current = children[cursorRef.current];
      current.classList.remove(ICON_SELECTED_CLASSNAME);
      destroyTippyFrom(current);
    }

    chatInputTextRef.current = null;
    cursorRef.current = -1;
    isOpenRef.current = false;
    setActiveIconIndexList([]);
    hideAllTippy({ duration: 0 });
  };

  const openSelector = (iconIndexList?: number[]) => {
    setActiveIconIndexList(iconIndexList ? iconIndexList : searchIcon(''));
    const inputText =
      chatInputRef.current === null ? '' : chatInputRef.current.innerText;
    chatInputTextRef.current = inputText.trim();
    isOpenRef.current = true;
    /** 텍스트 입력창에 포커스 */
    ChatInputListener.setFocus(chatInputTextRef.current.length);
  };

  const onkeydownHandler = (event: Event) => {
    /** 선택창 열려있을 때에만 수행 */
    if (isOpenRef.current !== true) return;

    const inputText = (event.target as HTMLDivElement).innerText;
    const inputKey = (event as KeyboardEvent).key || '';

    if ('__betterttv' in window && COMMAND_KEYS.includes(inputKey)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      setTimeout(() => {
        /** bttv와 충돌이 있어서 딜레이없이 설정할 수 없음 */
        if (chatInputTextRef.current !== null) {
          ChatInputListener.setInputValue(chatInputTextRef.current);
        }
      }, 60);
    }
    // chatInputTextRef.current = inputText.trim();

    switch (inputKey) {
      case 'Enter': {
        if (listRef.current && cursorRef.current !== -1) {
          /** 선택항목이 있으면 자동으로 아이콘 입력 */
          const activeIconElements = getActiveIconElements();

          const current = activeIconElements[cursorRef.current];
          const currentKeyword = current.getAttribute('alt') || '';

          // alt 값에는 `~`가 포함되어 있어서 keywordStartIdx에 1을 더할 필요 없음.
          const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
          const newInputText = `${inputText.slice(
            0,
            keywordStartIdx
          )}${currentKeyword}`;

          ChatInputListener.setInputValue(newInputText);
        }

        // TODO: 이 block에서 inputText를 사용해서 통계 생성
        closeSelector();
        LocalStorage.cache.set(STORAGE_KEY.CACHE.CHAT_INPUT, inputText);

        /**
         * 엔터 입력하면 자동으로 끝까지
         */
        if (window.iconttv.domSelector.chatScrollableContainer === undefined)
          return;
        const chatScrollBar = document.querySelector(
          window.iconttv.domSelector.chatScrollableContainer
        );
        if (chatScrollBar) {
          chatScrollBar.scrollTop = chatScrollBar.scrollHeight;
        }
        return;
      }

      case ' ': {
        closeSelector();
        return;
      }

      case 'Backspace': {
        if (inputText.endsWith('~') || inputText.trim().length === 0) {
          closeSelector();
        }
        return;
      }

      case 'ArrowRight': {
        const activeIconElements = getActiveIconElements();
        const currentCursor = cursorRef.current;
        const nextCursor = getNextCursor(
          currentCursor,
          activeIconElements.length,
          1
        );

        if (currentCursor !== -1) {
          const current = activeIconElements[currentCursor];
          current.classList.remove(ICON_SELECTED_CLASSNAME);
          destroyTippyFrom(current);
        }

        const next = activeIconElements[nextCursor];
        next.classList.add(ICON_SELECTED_CLASSNAME);
        addTippyTo(next);

        next.scrollIntoView({ block: 'center', inline: 'nearest' });

        cursorRef.current = nextCursor;
        return;
      }

      case 'ArrowLeft': {
        if (cursorRef.current === -1) return;
        const activeIconElements = getActiveIconElements();
        const currentCursor = cursorRef.current;
        const nextCursor = getNextCursor(
          currentCursor,
          activeIconElements.length,
          -1
        );

        const current = activeIconElements[currentCursor];
        const next = activeIconElements[nextCursor];

        current.classList.remove(ICON_SELECTED_CLASSNAME);
        next.classList.add(ICON_SELECTED_CLASSNAME);

        destroyTippyFrom(current);
        addTippyTo(next);

        next.scrollIntoView({ block: 'center', inline: 'nearest' });

        cursorRef.current = nextCursor;
        return;
      }

      case 'ArrowUp': {
        if (cursorRef.current === -1) return;
        const activeIconElements = getActiveIconElements();
        const currentCursor = cursorRef.current;
        const nextCursor = getNextCursor(
          currentCursor,
          activeIconElements.length,
          -1 * getNumberOfColumns()
        );

        const current = activeIconElements[currentCursor];
        const next = activeIconElements[nextCursor];

        current.classList.remove(ICON_SELECTED_CLASSNAME);
        next.classList.add(ICON_SELECTED_CLASSNAME);

        destroyTippyFrom(current);
        addTippyTo(next);

        next.scrollIntoView({ block: 'center', inline: 'nearest' });

        cursorRef.current = nextCursor;
        return;
      }

      case 'ArrowDown': {
        if (cursorRef.current === -1) return;
        const activeIconElements = getActiveIconElements();
        const currentCursor = cursorRef.current;
        const nextCursor = getNextCursor(
          currentCursor,
          activeIconElements.length,
          getNumberOfColumns()
        );

        const current = activeIconElements[currentCursor];
        const next = activeIconElements[nextCursor];

        current.classList.remove(ICON_SELECTED_CLASSNAME);
        next.classList.add(ICON_SELECTED_CLASSNAME);

        destroyTippyFrom(current);
        addTippyTo(next);

        next.scrollIntoView({ block: 'center', inline: 'nearest' });

        cursorRef.current = nextCursor;
        return;
      }
    }
  };

  const onkeyupHandler = (event: Event) => {
    const inputText = (event.target as HTMLDivElement).innerText;
    const inputKey = (event as KeyboardEvent).key || '';

    if (COMMAND_KEYS.includes(inputKey) && isOpenRef.current === true) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }

    switch (inputKey) {
      case 'Tab': {
        if (!listRef.current || cursorRef.current === -1) return;
        const activeIconElements = getActiveIconElements();

        const current = activeIconElements[cursorRef.current];
        const currentKeyword = current.getAttribute('alt') || '';

        // alt 값에는 `~`가 포함되어 있어서 keywordStartIdx에 1을 더할 필요 없음.
        const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
        const newInputText = `${inputText.slice(
          0,
          keywordStartIdx
        )}${currentKeyword}`;

        ChatInputListener.setInputValue(newInputText);

        closeSelector();
        return;
      }

      case 'Escape': {
        closeSelector();
        return;
      }

      case MAGIC_CHAR: {
        openSelector();
        return;
      }

      default: {
        if (inputText.trim().length === 0) {
          /**
           * 선택기 열어두고 del키 등으로 입력 삭제했을 때
           * 선택기를 닫아야함
           */
          if (!ARROW_KEYS.includes(inputKey)) closeSelector();
          return;
        }

        /**
         * `~`이 없으면 종료
         */
        const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
        if (keywordStartIdx === -1) return;

        /**
         * `~`이후에 공백이 포함되어 있으면 종료
         */
        const keyword = inputText.slice(keywordStartIdx + 1);
        if (keyword.includes(' ')) return;

        /**
         * 아이콘 검색 수행
         */
        const searchResult = searchIcon(keyword);
        openSelector(searchResult);

        /**
         * 선택기 열린 상태로 단어 입력하여
         * 새로운 검색 결과를 얻었을 때
         * cursor가 전체 아이콘 길이 넘어가는 문제 해결
         */
        if (!ARROW_KEYS.includes(inputKey) && cursorRef.current !== -1) {
          cursorRef.current = searchResult.length > 0 ? 0 : -1;
          hideAllTippy();
        }
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setActiveIconIndexList(defaultIconList.map((_, i) => i));

    if (!document.getElementById('iconttv-picker')) {
      waitFor(() =>
        document.querySelector(window.iconttv.domSelector.defaultEmotePicker)
      ).then((emotePicker) => {
        if (!emotePicker) return;
        const emotePickerParent = emotePicker.parentElement;

        const button = document.createElement('button');
        const buttonImg = document.createElement('img');
        button.className = emotePicker.className;
        button.setAttribute('aria-label', '디시콘 선택창');
        button.setAttribute('data-a-target', 'iconttv-picker-button');
        button.id = 'iconttv-picker';
        button.style.width = '30px';
        button.style.height = '30px';
        button.onclick = () => {
          if (isOpenRef.current) {
            closeSelector();
          } else {
            openSelector();
          }
        };

        buttonImg.style.backgroundImage = `url(${AppIconImage()})`;
        buttonImg.style.backgroundSize = 'contain';
        buttonImg.style.width = '20px';
        buttonImg.style.height = '20px';
        button.appendChild(buttonImg);

        emotePickerParent?.insertBefore(button, emotePickerParent.firstChild);

        /** 아이콘 추가해서 입력 창 크기 조절 */
        const chatInput = document.querySelector(
          window.iconttv.domSelector.chatInput
        ) as HTMLDivElement;
        if (!chatInput) return;
        const prevValue = Number.parseFloat(chatInput.style.paddingRight);
        if (Number.isNaN(prevValue)) return;
        chatInput.style.paddingRight = `${prevValue + 1}rem`;
      });
    }

    waitFor(() =>
      document.querySelector(window.iconttv.domSelector.chatInput)
    ).then((chatInput) => {
      chatInputRef.current = chatInput as HTMLDivElement;
      chatInputRef.current.onkeyup = onkeyupHandler;

      /**
       * 이거는 누르고 있을 때 계속 캡쳐됨
       */
      chatInputRef.current.onkeydown = onkeydownHandler;
    });

    return () => {
      waitFor(() =>
        document.querySelector(window.iconttv.domSelector.chatInput)
      ).then((chatInput) => {
        chatInputRef.current = chatInput as HTMLDivElement;
        chatInputRef.current.onkeyup = () => {};
        chatInputRef.current.onkeydown = () => {};
      });
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const children = listRef.current.children;

    for (const child of children) {
      const iconIdx = Number(child.getAttribute('data-icon-idx') || -1);

      if (activeIconIndexList.includes(iconIdx)) {
        child.classList.remove(ICON_HIDE_CLASSNAME);
      } else {
        child.classList.add(ICON_HIDE_CLASSNAME);
        destroyTippyFrom(child);
      }
    }
  }, [activeIconIndexList]);

  return (
    <Box
      className="iconttv-selector-wrapper"
      sx={{
        display:
          isOpenRef.current && activeIconIndexList.length > 0
            ? 'block'
            : 'none',
      }}
    >
      <Stack
        className="iconttv-selector-list"
        direction="row"
        flexWrap="wrap"
        ref={listRef}
      >
        {defaultIconList.map((icon, idx) => (
          // biome-ignore lint/a11y/useKeyWithMouseEvents: <explanation>
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <img
            width={40}
            height={40}
            key={`${idx}-${icon.keywords[0]}`}
            className={'iconttv-selector-item iconttv-common lazy'}
            src={`${getIconUrl(icon.thumbnailUri)}`}
            alt={`~${icon.keywords[0]}`}
            loading="lazy"
            decoding="async"
            data-tippy-content={`~${icon.keywords[0]}`}
            data-icon-idx={idx}
            onMouseOver={(event) => {
              addTippyTo(event.target as Element);
            }}
            onMouseOut={(event) => {
              destroyTippyFrom(event.target as Element);
            }}
            onClick={() => {
              if (!chatInputRef.current) return;

              const inputText = chatInputRef.current.innerText;
              if (inputText.trim().length === 0) {
                ChatInputListener.setInputValue(`~${icon.keywords[0]}`);
              } else {
                const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
                ChatInputListener.setInputValue(
                  keywordStartIdx === -1
                    ? `${inputText}~${icon.keywords[0]}`
                    : `${inputText.slice(0, keywordStartIdx + 1)}${
                        icon.keywords[0]
                      }`
                );
              }
              closeSelector();
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export function mountIconSelector(element: Element) {
  if (document.getElementById(ICONTTV_SELECTOR_ID)) return;

  const app = document.createElement('div');
  app.id = ICONTTV_SELECTOR_ID;
  app.className = ICONTTV_SELECTOR_ID;
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<IconSelector />);

  return app;
}

export function unmountIconSelector() {
  const selector = document.getElementById(ICONTTV_SELECTOR_ID);
  if (selector) selector.remove();
}
