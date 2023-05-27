import { Container, Divider, Box } from '@mui/material';
import React from 'react';
import { createRoot } from 'react-dom/client';

const SETTING_ID = 'iconttv-settings-root';

function Settings() {
  return (<Box>
    <Divider />
    <Container>Iconttv settings (WIP)</Container>
  </Box>)
}

export function injectSettings(element: Element) {
  if (document.getElementById(SETTING_ID)) return;

  const app = document.createElement('div');
  app.id = SETTING_ID;
  element.appendChild(app);

  const root = createRoot(app);
  root.render(<Settings />);
}
