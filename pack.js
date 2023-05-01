const { existsSync, mkdirSync } = require('fs');
const AdmZip = require('adm-zip');
const VERSION = require('./src/version');

const APP_NAME = 'iconttv';
const isFirefox = process.env.BROWSER_ENV === 'firefox';

try {
  const outdir = 'release';
  const filename = isFirefox
    ? `${APP_NAME}-firefox-v${VERSION}.zip`
    : `${APP_NAME}-chrome-v${VERSION}.zip`;
  const zip = new AdmZip();
  zip.addLocalFolder('build');
  if (!existsSync(outdir)) {
    mkdirSync(outdir);
  }
  zip.writeZip(`${outdir}/${filename}`);

  console.log(
    `Success! Created a ${filename} file under ${outdir} directory. You can upload this file to web store.`
  );
} catch (e) {
  console.error('Error! Failed to generate a zip file.');
}
