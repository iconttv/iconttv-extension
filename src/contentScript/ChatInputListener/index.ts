import Logger from '../../Logger';
import TWITCH_SELECTORS from '../utils/selectors';

class ChatInputListener {
  static #instance: ChatInputListener;

  inputComponent: any;
  editorComponent: any;

  constructor() {
    if (ChatInputListener.#instance) return ChatInputListener.#instance;
    ChatInputListener.#instance = this;

    this.inputComponent = null;
    this.editorComponent = null;
  }

  __getReactInstance(selector: string) {
    const element = document.querySelector(selector);
    if (!element)
      return null;

    for (const key in element) {
      if (key.startsWith('__reactInternalInstance')) {
        return (element as any)[key];
      }
    }
    return null;
  }

  __getReactComponent(
    selector: string,
    condition: (a: any) => boolean,
    maxDepth = 20
  ) {
    let reactInstance = this.__getReactInstance(selector);
    if (!reactInstance)
      return null;

    let depth = 0;
    while (depth < maxDepth) {
      if (condition(reactInstance)) {
        return reactInstance;
      }
      reactInstance = reactInstance.return;
      depth += 1;
    }
    return null;
  }

  __getInputComponent() {
    if (this.inputComponent)
      return this.inputComponent;
    if (!window.iconttv)
      return null;

    this.inputComponent = this.__getReactComponent(
      TWITCH_SELECTORS.chatInput,
      (elem) =>
        elem.memoizedProps &&
        elem.memoizedProps.componentType != null &&
        elem.memoizedProps.value != null
    );

    return this.inputComponent;
  }

  __getEditorComponent() {
    if (this.editorComponent)
      return this.editorComponent;
    if (!window.iconttv)
      return null;

    this.editorComponent = this.__getReactComponent(
      TWITCH_SELECTORS.chatInput,
      (elem) => elem.stateNode?.state?.slateEditor != null
    )?.stateNode;

    return this.editorComponent;
  }

  getInputValue(): string {
    const inputComponent = this.__getInputComponent();
    if (!inputComponent)
      return '';

    return this.inputComponent.memoizedProps.value;
  }

  setInputValue(text: string, setFocus: boolean) {
    const inputComponent = this.__getInputComponent();
    if (!inputComponent)
      return;

    const nextText = `${inputComponent.memoizedProps.value} ${text} `;

    inputComponent.memoizedProps.value = nextText;
    inputComponent.memoizedProps.setInputValue(nextText);
    inputComponent.memoizedProps.onValueUpdate(nextText);

    if (setFocus)
      this.setFocus(nextText.length);
  }

  setFocus(textLength: number) {
    const editorComponent = this.__getEditorComponent();
    if (!editorComponent) return;

    editorComponent.focus();
    editorComponent.setSelectionRange(textLength);
  }
}

export default new ChatInputListener();
