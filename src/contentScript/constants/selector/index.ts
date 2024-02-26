export interface DOMSelector {
  chatBody: string;
  chatText: string;
  chatInput: string;
  chatScrollableContainer: string;
  chatThirdPartyEmote: string;

  chatInputEditor: string;
  chatButtonContainer: string;

  chatSettingButton: string;
  chatSettingContainer: string;
  chatSettingContainerSeperator: string;

  iconSelectorParent: string;

  defaultEmotePicker: string;
}

export type DOMSelectorKey = keyof DOMSelector;

export type DOMSelectorValue = DOMSelector[DOMSelectorKey];
