import type { DOMSelector } from '.';

export const CHZZK_SELECTOR: DOMSelector = {
  // chatLineMessage: `.chat-line__message`,
  chatBody: `button[class^="live_chatting_message_wrapper__"]`,
  chatText: `span[class^="live_chatting_message_text__"]`,
  chatInput: `pre[class^="live_chatting_input_input__"]`,
  chatScrollableContainer: `div[class^='live_chatting_list_wrapper__']`,

  // textarea: non login, pre: login
  chatInputEditor: `textarea[class^="live_chatting_input_input__"], pre[class^="live_chatting_input_input__"]`,

  ///// TODO below

  chatThirdPartyEmote: ".bttv-emote, .seventv-emote-box",

  chatButtonContainer: `[data-test-selector="chat-input-buttons-container"]`,
  chatSettingButton: `[data-a-target="chat-settings"]`,
  chatSettingContainer: `[data-a-target="chat-settings-balloon"] [data-a-target="chat-settings-mod-view"]`,
  chatSettingContainerSeperator: `[role="separator"]`,

  iconSelectorParent: ".rich-input-container",

  /** parentElement로 상위 컨테이너 가져와야 함 */
  defaultEmotePicker: `[data-a-target="emote-picker-button"]`,
} as const;
