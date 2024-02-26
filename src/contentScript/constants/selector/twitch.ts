import { DOMSelector } from '.';

export const TWITCH_SELECTOR: DOMSelector = {
  // chatLineMessage: `.chat-line__message`,
  chatBody: `[data-a-target="chat-line-message-body"], .seventv-chat-message-body`,
  chatText: `.text-fragment, .text-token`,
  chatInput: `[data-a-target="chat-input"]`,
  chatScrollableContainer: `div[data-a-target='chat-scroller'] .simplebar-scroll-content`,
  chatThirdPartyEmote: `.bttv-emote, .seventv-emote-box`,

  // chatInputEditor: `.rich-input-container`,
  chatInputEditor: `textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]`,

  chatButtonContainer: `[data-test-selector="chat-input-buttons-container"]`,
  chatSettingButton: `[data-a-target="chat-settings"]`,
  chatSettingContainer: `[data-a-target="chat-settings-balloon"] [data-a-target="chat-settings-mod-view"]`,
  chatSettingContainerSeperator: `[role="separator"]`,

  iconSelectorParent: `.rich-input-container`,

  /** parentElement로 상위 컨테이너 가져와야 함 */
  defaultEmotePicker: `[data-a-target="emote-picker-button"]`,
} as const;
