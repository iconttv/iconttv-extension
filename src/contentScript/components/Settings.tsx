import { Container, Divider, Box } from '@mui/material';
import React from 'react';
import { createRoot } from 'react-dom/client';

const ICONTTV_SETTING_ID = 'iconttv-settings-root';

function Settings() {
  return (<Box>
    <Divider />
    <Container>Iconttv settings (WIP)</Container>
  </Box>)
}

export function mountSettings(element: Element) {
  return;
  // if (document.getElementById(ICONTTV_SETTING_ID)) return;

  // const app = document.createElement('div');
  // app.id = ICONTTV_SETTING_ID;
  // element.appendChild(app);

  // const root = createRoot(app);
  // root.render(<Settings />);
}

export function unmountSettings() {
  const settings = document.getElementById(ICONTTV_SETTING_ID);
  if (settings) settings.remove();
}
