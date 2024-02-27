import tippy, { Props, hideAll } from 'tippy.js';

export async function waitFor<T>(callback: () => T, timeout = -1): Promise<T> {
  return new Promise((resolve, reject) => {
    const itvl = setInterval(() => {
      const res = callback();
      if (res) {
        clearInterval(itvl);
        resolve(res);
      }
    }, 100);

    if (timeout > 0) {
      setTimeout(() => {
        clearInterval(itvl);
        reject('timeout');
      }, timeout);
    }
  });
}

export function destroyTippyFrom(element: Element) {
  (element as any)._tippy && (element as any)._tippy.destroy();
}

export const hideAllTippy = hideAll;

export function addTippyTo(
  element: Element,
  optionalProps?: Partial<Props> | undefined
) {
  const options: Partial<Props> = {
    hideOnClick: true,
    placement: 'top-start',
    theme: window.iconttv.streamPlatform,
    arrow: true,
    ...optionalProps,
  };

  tippy(element, options).show();
}
