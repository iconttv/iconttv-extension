const TWITCH_SELECTORS = {
  chatLineMessage: `.chat-line__message`,
  chatBody: `[data-a-target="chat-line-message-body"]`,
  chatText: `.text-fragment`,
  chatInput: `[data-a-target="chat-input"]`,
  chatScroll: `div[data-a-target='chat-scroller'] .simplebar-scroll-content`,

  chatInputEditor: `.chat-wysiwyg-input__editor`,

  chatButtonContainer: `[data-test-selector="chat-input-buttons-container"]`,
  chatSettingButton: `[data-a-target="chat-settings"]`,
  chatSettingContainer: `[data-a-target="chat-settings-balloon"] [data-a-target="chat-settings-mod-view"]`,
  chatSettingContainerSeperator: `[role="separator"]`,

  iconSelectorParent: `.rich-input-container`,
} as const;

export type TwitchSelectorKeys = keyof typeof TWITCH_SELECTORS;
export type TwitchSelectors = (typeof TWITCH_SELECTORS)[TwitchSelectorKeys];

export default TWITCH_SELECTORS;
