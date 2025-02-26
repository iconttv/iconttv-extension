import type { DOMSelector } from '.';

export const CHZZK_SELECTOR: DOMSelector = {
  // chatLineMessage: `.chat-line__message`,
  chatBody:
    `div[class^="live_chatting_message_chatting_message__"]` +
    // `, div[class^="live_chatting_message_wrapper__"]` + // streamer preview page
    // disabled because streamer id is different
    `, div[class^="live_chatting_subscription_message_container__"]` + // subscription message
    `, div[class^="live_chatting_donation_message_wrapper__"]`, // donation message
  chatText:
    `span[class^="live_chatting_message_text__"]` +
    `, p[class^="live_chatting_subscription_message_detail__"]` + // subscription message
    `, p[class^="live_chatting_donation_message_text__"]`, // donation message
  chatInput: `pre[class^="live_chatting_input_input__"]`,

  chatScrollableContainer: `div[class^='live_chatting_list_wrapper__']`,

  // textarea: non login, pre: login
  chatInputEditor: `textarea[class^="live_chatting_input_input__"], pre[class^="live_chatting_input_input__"]`,

  ///// TODO below

  chatThirdPartyEmote: '.bttv-emote, .seventv-emote-box',

  chatButtonContainer: `[data-test-selector="chat-input-buttons-container"]`,
  chatSettingButton: `[data-a-target="chat-settings"]`,
  chatSettingContainer: `[data-a-target="chat-settings-balloon"] [data-a-target="chat-settings-mod-view"]`,
  chatSettingContainerSeperator: `[role="separator"]`,

  iconSelectorParent: '.rich-input-container',

  /** parentElement로 상위 컨테이너 가져와야 함 */
  defaultEmotePicker: `[data-a-target="emote-picker-button"]`,
} as const;
