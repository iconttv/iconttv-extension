import React, { useEffect, useRef, useState } from "react";
import { createRoot } from 'react-dom/client';
import { Box, Stack } from '@mui/material';
import {hideAll} from 'tippy.js';
import TWITCH_SELECTORS from "../utils/selectors";
import { addTippyTo, destroyTippyFrom, waitFor } from "../utils/elements";
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';
import { ServerIconList } from "../../common/types";
import { getIconUrl } from "../server/api";
import { searchIcon } from "../ChatListener/iconSearch";
import ChatInputListener, { ChatInputListenerEventTypes } from "../ChatInputListener";
import { MAGIC_CHAR } from "../ChatListener/iconApply";

import '../styles/selector.css';


/**
 * 채팅 입력이 변할 때마다 새로 렌더링하면 
 * 이벤트리스너에서 소요 시간이 많이 걸리므로 
 * UX에 좋지 않음
 * 
 * 대신 모든 아이콘 요소를 만들어 둔 후
 * 조건에 따라서 display: none, block을
 * 변경하면 됨
 * 
 * @returns React.ReactNode
 */
function IconSelector() {
  const ICON_SELECTED_CLASSNAME = 'iconttv-item-selected';
  const ICON_HIDE_CLASSNAME = 'iconttv-hide';
  
  const defaultIconList = (
    LocalStorage.cache.get(STORAGE_KEY.CACHE.SERVER_ICON_LIST) as ServerIconList
  ).icons;

  const listRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(-1);
  const chatInputRef = useRef<HTMLDivElement | null>(null);
  const prevInputText = useRef("");
  const [isOpen, setIsOpen] = useState(false);
  const [iconIdxList, setIconIdxList] = useState<number[]>([]);

  const closeSelector = () => {
    cursorRef.current = -1
    setIsOpen(false);
    setIconIdxList([]);
    hideAll({ duration: 0 })
  }

  const keyInputHandler = (event: Event) => {
    const inputText = (event.target as HTMLDivElement).innerText
    const inputKey = (event as KeyboardEvent).key || '';
      
    switch (inputKey) {
      case ("Enter"): {
        // 이 block에서 inputText를 사용해서 통계 생성
        closeSelector();
        prevInputText.current = inputText;

        /**
         * 엔터 입력하면 자동으로 끝까지
         */
        const chatScrollBar = document.querySelector(TWITCH_SELECTORS.chatScroll);
        if (chatScrollBar) {
          chatScrollBar.scrollTop = chatScrollBar.scrollHeight;
        }
        break;
      }
      
      case ("ArrowRight"): {
        if (!listRef.current) return;
        const children = Array.from(listRef.current.children)
          .filter(element => !element.classList.contains(ICON_HIDE_CLASSNAME));

        const currentCursor = cursorRef.current;
        const nextCursor = children.length === cursorRef.current + 1 ? 0 : cursorRef.current + 1;

        if (currentCursor !== -1) {
          const current = children[currentCursor];
          current.classList.remove(ICON_SELECTED_CLASSNAME);
          destroyTippyFrom(current);
        }

        const next = children[nextCursor];
        next.classList.add(ICON_SELECTED_CLASSNAME);
        addTippyTo(next);

        next.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth",});

        cursorRef.current = nextCursor;
        return;
      }
        
      case ("ArrowLeft"): {
        if (!listRef.current) return;
        const children = Array.from(listRef.current.children)
          .filter(element => !element.classList.contains(ICON_HIDE_CLASSNAME));
        
        const currentCursor = cursorRef.current;
        const nextCursor = cursorRef.current - 1 < 0 ? children.length - 1 : cursorRef.current - 1;
        
        const current = children[currentCursor];
        const next = children[nextCursor];

        current.classList.remove(ICON_SELECTED_CLASSNAME);
        next.classList.add(ICON_SELECTED_CLASSNAME);

        destroyTippyFrom(current);
        addTippyTo(next);

        next.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth",});

        cursorRef.current = nextCursor;
        return;
      }
    }
  };


  const keyCommandHandler = (event: Event) => {
    const inputText = (event.target as HTMLDivElement).innerText
    const inputKey = (event as KeyboardEvent).key || '';
      
    switch (inputKey) {
      case ("ArrowDown"): {
        if (!listRef.current) return;
        const children = Array.from(listRef.current.children)
          .filter(element => !element.classList.contains(ICON_HIDE_CLASSNAME));
        
        const current = children[cursorRef.current]
        const currentKeyword = current.getAttribute('alt') || "";

        const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
        const newInputText = `${inputText.slice(0, keywordStartIdx)}${currentKeyword}`;

        ChatInputListener.setInputValue(newInputText);

        closeSelector()
        return;
      }
        
      case ("Escape"): {
        closeSelector();
        return;
      }
      
      default: {
        /**
         * 조합키는 inputText로 바로 인식 되지 않고
         * inputKey로 인식됨
         */
        if (inputText.length === 0 && inputKey !== MAGIC_CHAR) {
          closeSelector();
          return;
        }

        const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
        const keyword = inputText.slice(keywordStartIdx + 1);
    
        if (keyword.includes(' ')) {
          closeSelector();
          return;
        };
        
        /**
         * 아이콘 검색 수행 
         * 입력 끝났을 때 수행하는게 더 효율적이라 생각함
         */
        const searchResult = searchIcon(keyword);
        setIconIdxList(searchResult);
        setIsOpen(true);
      }
    }
  };


  useEffect(() => {
    ChatInputListener.on(ChatInputListenerEventTypes.NEW_VALUE, (text: string) => {
      prevInputText.current = text;
    })

    waitFor(() => document.querySelector(TWITCH_SELECTORS.chatInput))
      .then(chatInput => {
        chatInputRef.current = chatInput as HTMLDivElement
        chatInputRef.current.onkeyup = keyCommandHandler;

        /**
         * 이거는 누르고 있을 때 계속 캡쳐됨
         */
        chatInputRef.current.onkeydown = keyInputHandler;
      });
  }, []);


  useEffect(() => {
    if (!listRef.current) return;
    const children = listRef.current.children;

    for (const child of children) {
      const iconIdx = Number(child.getAttribute('data-icon-idx') || -1);

      if (iconIdxList.includes(iconIdx)) {
        child.classList.remove(ICON_HIDE_CLASSNAME)        
      } else {
        child.classList.add(ICON_HIDE_CLASSNAME)
        destroyTippyFrom(child);
      }
    }

  }, [iconIdxList])


  return <Box className='iconttv-selector-wrapper' sx={{
    display: (isOpen && iconIdxList.length > 0) ? 'block' : 'none'
  }}>
    <Stack className="iconttv-selector-list" direction='row' flexWrap='wrap' ref={listRef}>
      {defaultIconList.map((icon, idx) => (
        <img
          key={icon.keywords[0]}
          className={`iconttv-selector-item iconttv-common lazy`}
          src={`${getIconUrl(icon.thumbnailUri)}`}
          alt={`~${icon.keywords[0]}`}
          loading="lazy"
          data-tippy-content={`~${icon.keywords[0]}`}
          data-icon-idx={idx}
          onMouseOver={function (event) {
            addTippyTo(event.target as Element);
          }}
          onMouseOut={function (event) {
            destroyTippyFrom(event.target as Element);
          }}
          onClick={function () {
            if (!chatInputRef.current) return;

            const inputText = chatInputRef.current.innerText;
            const keywordStartIdx = inputText.lastIndexOf(MAGIC_CHAR);
  
            ChatInputListener.setInputValue(`${inputText.slice(0, keywordStartIdx)}${icon.keywords[0]}`);
  
            closeSelector()
          }}
        />
      ))}
    </Stack> 
  </Box>
}

export function injectIconSelector(element: Element) {
  const app = document.createElement('div');
  app.id = 'iconttv-selector-root';
  app.className = 'iconttv-selector-root';
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<IconSelector />)

  return app;
}
