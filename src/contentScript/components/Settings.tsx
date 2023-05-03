import React from 'react';
import ReactDOM from 'react-dom';

function Settings() {
  return (<div>sadfsadfasfdfd</div>)
}

export function injectSettings(element: Element) {
  const app = document.createElement('div');
  app.id = 'iconttv-settings-root';

  element.appendChild(app);
  ReactDOM.render(<Settings />, app);
}
