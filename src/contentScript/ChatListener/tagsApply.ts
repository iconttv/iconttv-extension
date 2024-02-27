/**
 * 더 나은 마퀴태그 파싱도 있지만
 * bridgeBBCC와 동일한 동작을 보장하기 위해서
 * 이런 방식으로 구현함.
 */

interface MarqueeOptions {
  direction?: string;
  behavior?: string;
  loop?: string;
  scrollamount?: string;
  scrolldelay?: string;
  body: string;
}

/**
 *
 * @param options
 * @returns html marquee string
 */
function replaceMarquee(options: MarqueeOptions) {
  let {
    direction = '',
    behavior = '',
    loop = '',
    scrollamount = '',
    scrolldelay = '',
    body,
  } = options;

  if (body.length === 0) return '';

  if (Number(scrollamount.replace(/[^0-9]/g, '')) > 50) {
    scrollamount = ` scrollamount=50`;
  }

  return `<marquee ${direction} ${behavior} ${loop} ${scrollamount} ${scrolldelay} > ${body} </marquee>`;
}

export function escapeHTMLTags(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&amp;gt/g, '&gt')
    .replace(/&amp;lt/g, '&lt');
}

/**
 * fork from https://funzinnu.com/stream/js/chatassist.js
 *
 * []또는 ``` 등으로 표시된 스타일 태그를 변경
 *
 * 띄어쓰기를 추가해야 제대로 표기될 것이라 생각함.
 *
 * @param text chat message
 * @returns parsed html string
 */
export function replaceStyleTags(text: string) {
  // 나무위키식
  text = text.replace(/'''(.*)'''/gi, '<b>$1</b>');
  text = text.replace(/''(.*)''/gi, '<i>$1</i>');
  text = text.replace(/~~(.*)~~/gi, '<strike>$1</strike>');
  text = text.replace(/--(.*)--/gi, '<strike>$1</strike>');
  text = text.replace(/__(.*)__/gi, '<u>$1</u>');

  //닫는 태그가 있는 [b][i][s]
  text = text.replace(/\[b\](.*)\[\/b\]/gi, '<b>$1</b>'); //볼드 [b]blah
  text = text.replace(/\[i\](.*)\[\/i\]/gi, '<i>$1</i>'); //이탤릭 [i]blah
  text = text.replace(/\[s\](.*)\[\/s\]/gi, '<strike>$1</strike>'); //취소선 [s]blah

  //닫는 태그가 없는 [b][i][s]
  text = text.replace(/\[b\](.*)/gi, '<b>$1</b>'); //볼드 [b]blah
  text = text.replace(/\[i\](.*)/gi, '<i>$1</i>'); //이탤릭 [i]blah
  text = text.replace(/\[s\](.*)/gi, '<strike>$1</strike>'); //취소선 [s]blah

  //강제개행
  text = text.replace(/\[br\]/gi, '<br/>');

  /**
   * [mq] marquee 태그
   *
   * chatassist에서 가져왔는데 이 방식은
   * direction, behavior, loop, scrollamount, scrolldelay 순서가 맞아야만 실행이 됨.
   *
   * 사용자 입장에서는 불편하지만
   * 스트리머 쪽에서도 이렇게 렌더링이 되기 때문에
   * 이대로 구현함
   *
   * 순서 상관 없이 하려면 속성 값 부분 통채로 함수에 넘겨서 처리하도록 하면 됨.
   *
   *  */
  const regex =
    /\[mq( direction=[^\ ]*)?( behavior=[^\ ]*)?( loop=[^\ ]*)?( scrollamount=[^\ ]*)?( scrolldelay=[^\ ]*)?\](.+)\[\/mq\]/gi;
  const match = regex.exec(text);
  if (match) {
    text = replaceMarquee({
      direction: match[1],
      behavior: match[2],
      loop: match[3],
      scrollamount: match[4],
      scrolldelay: match[5],
      body: match[6],
    });
  }

  return text;
}
