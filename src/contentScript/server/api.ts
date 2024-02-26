import { ServerIconList } from '../../common/types';
const VERSION = require('../../version.js');

/**
 * Icon backend server endpoint without trailing slash(`/`)
 * currently using https://github.com/drowsy-probius/twitch-icon-cache
 */
const API_ENDPOINT = 'https://api.probius.dev/twitch-icons/cdn';

function fetchWrapper(api: string, options?: RequestInit): Promise<Response> {
  const userAgent = navigator.userAgent.toLowerCase();
  const HEADERS = {
    'User-Agent': `${userAgent} Iconttv/${VERSION}`,
  };
  return fetch(api, {
    ...options,
    headers: HEADERS,
  });
}

export const AppIconImage = (size = 32) =>
  `https://api.probius.dev/twitch-icons/cdn/icon?size=${size}`;

export const emptyIconListResponse = {
  icons: [],
  timestamp: 0,
};

export async function getIconList(streamerId: string): Promise<ServerIconList> {
  const res = await fetchWrapper(
    `${API_ENDPOINT}/list/by?platform=${window.iconttv.streamPlatform}&streamer=${streamerId}`
  );
  const resJson = await res.json();
  if (res.status !== 200) {
    throw new Error(`[${res.status}] ${JSON.stringify(resJson)}`);
  }
  return resJson;
}

export function getIconUrl(urlpath: string): string {
  if (urlpath.startsWith('http://') || urlpath.startsWith('https://')) {
    return urlpath;
  }
  if (urlpath.startsWith('./')) {
    return `${API_ENDPOINT}/${urlpath.slice(2)}`;
  }
  if (urlpath.startsWith('/')) {
    return `${API_ENDPOINT}/${urlpath.slice(1)}`;
  }
  return `${API_ENDPOINT}/${urlpath}`;
}
