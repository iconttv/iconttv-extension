import React from 'react';
import { createRoot } from 'react-dom/client';

function Settings() {
  return (<div>sadfsadfasfdfd</div>)
}

export function injectSettings(element: Element) {
  const app = document.createElement('div');
  app.id = 'iconttv-settings-root';
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<Settings />);
}
