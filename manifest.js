const { writeFileSync } = require('fs');

const { VERSION, VERSION_NAME } = require('./src/version');

const isFirefox = process.env.BROWSER_ENV === 'firefox';
require('dotenv').config({
  path: '.env.local',
});

function formManifest() {
  const manifest = {
    manifest_version: 3,
    name: 'iconttv',
    version: VERSION,
    version_name: VERSION_NAME,
    description: 'iconttv Official Extension',
    icons: {
      16: 'icons/16.icon.png',
      32: 'icons/32.icon.png',
      48: 'icons/48.icon.png',
      128: 'icons/128.icon.png',
    },
    action: {
      default_title: 'Iconttv',
      default_popup: 'popup.html',
    },
    content_scripts: [
      {
        matches: ['*://*.twitch.tv/*', '*://*.chzzk.naver.com/*'],
        run_at: 'document_end',
        js: ['iconttv.js'],
        css: ['iconttv.css'],
        world: 'MAIN',
      },
    ],
  };

  if (isFirefox) {
    /**
     * Manifest Version 2
     */
    manifest['browser_specific_settings'] = {
      gecko: {
        id: process.env.FIREFOX_ADDON_ID,
      },
    };
    manifest['background'] = {
      scripts: ['background.js'],
    };
  } else {
    /**
     * Manifest Version 3
     */

    manifest['background'] = {
      service_worker: 'background.js',
    };
  }

  return manifest;
}

try {
  const manifest = formManifest();
  writeFileSync(`public/manifest.json`, JSON.stringify(manifest, null, 2), {
    encoding: 'utf8',
    flag: 'w',
  });
} catch (e) {
  console.error(e);
  console.error('Error! Failed to generate a manifest file.');
}
