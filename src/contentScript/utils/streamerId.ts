export type TwitchType = 'live' | 'popout' | 'vod' | 'clip';

/**
 * 근데 지금 observer 쓰는 방식에서 중요한가?
 * @returns
 */
function getTwitchType(href: string): TwitchType | void {
  if (href === 'https://www.twitch.tv/') return;
  const isVod = href.indexOf('/videos') !== -1;
  const isPopout = href.indexOf('/popout/') !== -1;
  const isClip = href.indexOf('/clip/') !== -1;
  const isLive = /http(s)?:\/\/(www.)?twitch.tv\/[^\/]+$/.exec(href) !== null;

  if (isLive) return 'live';
  if (isPopout) return 'popout';
  if (isVod) return 'vod';
  if (isClip) return 'clip';
  return;
}

export function getStreamerId(href: string): string {
  const hrefType = getTwitchType(href);

  switch (hrefType) {
    case 'popout': {
      /**
       * https://www.twitch.tv/popout/streamer/chat
       */
      return href.split('/').slice(-2)[0] ?? '';
    }
    case 'live': {
      /**
       * https://www.twitch.tv/streamer?asdf
       */
      return href.split('/').pop()?.split('?')[0] ?? '';
    }
    case 'clip': {
      /**
       * https://www.twitch.tv/streamer/clip/clip_id
       */
      return href.split('twitch.tv/').pop()?.split('/')[0] ?? '';
    }
    case 'vod': {
      /**
       * https://www.twitch.tv/videos/video_id_numbers
       */
      const homeAnchor = document.querySelector(
        `[tabname="home"]`
      ) as HTMLAnchorElement;
      const href = homeAnchor.href; // https://www.twitch.tv/streamer
      return href.split('/').pop() ?? '';
    }
  }
  return '';
}
