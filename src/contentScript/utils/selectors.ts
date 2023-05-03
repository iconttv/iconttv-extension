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

  // documentTitle: 'title',
  // documentHead: 'head',

  // chatInputText: `[data-a-target="chat-input-text"]`,

  // rightColumn: `.right-column`,

  // streamChat: `.stream-chat`,
  // hiddenChat: `[data-test-selector="stream-chat-hidden-state"]`,

  // chatArea: `.video-chat__message-list-wrapper ul, .chat-scrollable-area__message-container`,

  // chatLineParent: `.chat-line__no-background`,

  // iconSelectorParent: `.rich-input-container`,
  // inputSendButton: `[data-a-target="chat-send-button"]`,

  // iconSelectorPositionBase: `.chat-input`,
  // iconArea: `[data-a-target="watch-mode-to-home"]`,
  // offline: `.channel-status-info--offline`,

  // chatLineStatus: `.chat-line__status`,
  // vodMessage: `.vod-message__content, .vod-message`,
  // pinnedMessage: `.pinned-chat__message`,
} as const;

export type TwitchSelectorKeys = keyof typeof TWITCH_SELECTORS;
export type TwitchSelectors = (typeof TWITCH_SELECTORS)[TwitchSelectorKeys];

export default TWITCH_SELECTORS;
