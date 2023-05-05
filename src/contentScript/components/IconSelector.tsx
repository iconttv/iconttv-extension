import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import TWITCH_SELECTORS, { waitFor } from "../utils/selectors";
import Logger from "../../Logger";
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';


function IconSelector() {

  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const keyInputHandler = (event: Event) => {
    const innerText = (event.target as HTMLDivElement).innerText
    setInputText(innerText);
  }

  useState(() => {
    async function init() {
      const chatInput = await waitFor(() => document.querySelector(TWITCH_SELECTORS.chatInput));
      (chatInput as HTMLDivElement).onkeyup = keyInputHandler;
      (chatInput as HTMLDivElement).onpaste = keyInputHandler;
    }
    init();
  });

  // if (!isOpen) return <></>
  return <div>selector</div>
}

export function injectIconSelector(element: Element) {
  const app = document.createElement('div');
  app.id = 'iconttv-selector-root';
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<IconSelector />)

  return app;
}
