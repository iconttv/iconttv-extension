import React from 'react';
import { createRoot } from 'react-dom/client';

const SETTING_ID = 'iconttv-settings-root';

function Settings() {
  return (<div>Iconttv settings</div>)
}

export function injectSettings(element: Element) {
  if (document.getElementById(SETTING_ID)) return;

  const app = document.createElement('div');
  app.id = SETTING_ID;
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<Settings />);
}
