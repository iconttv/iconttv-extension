import SafeEventEmitter from '@metamask/safe-event-emitter';
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
    if (!element) return null;

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
    if (!reactInstance) return null;

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
    if (this.inputComponent) return this.inputComponent;
    if (!window.iconttv) return null;

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
    if (this.editorComponent) return this.editorComponent;
    if (!window.iconttv) return null;

    this.editorComponent = this.__getReactComponent(
      TWITCH_SELECTORS.chatInput,
      (elem) => elem.stateNode?.state?.slateEditor != null
    )?.stateNode;

    return this.editorComponent;
  }

  /**
   * 일단 버그가 많음.
   */
  // getStreamerName(): string {
  //   const editorComponent = this.__getEditorComponent();
  //   if (!editorComponent) return '';

  //   return editorComponent.props.channelLogin ?? '';
  // }

  getInputValue(): string {
    /**
     * inputComponent.memoizedProps.value 통해서 가져오면
     * 한 두글자가 짤림
     * eg. 안녕하세요 -> 안녕하세
     *
     * innerText 하면 마지막 문자가 잘림 (글자 말고)
     * eg. 안녕하세요 -> 안녕하셍
     *
     * input react component에 리스너 추가하는게 제일 나은 것 같음
     */

    // const inputComponent = this.__getInputComponent();
    // if (!inputComponent) return '';
    // Logger.debug(this.inputComponent);
    // return this.inputComponent.memoizedProps.value;

    const chatInput = document.querySelector(TWITCH_SELECTORS.chatInput);
    if (!chatInput) return '';
    return (chatInput as HTMLDivElement).innerText;
  }

  setInputValue(text: string, setFocus: boolean) {
    const inputComponent = this.__getInputComponent();
    if (!inputComponent) return;

    const nextText = `${inputComponent.memoizedProps.value} ${text} `;

    inputComponent.memoizedProps.value = nextText;
    inputComponent.memoizedProps.setInputValue(nextText);
    inputComponent.memoizedProps.onValueUpdate(nextText);

    if (setFocus) this.setFocus(nextText.length);
  }

  setFocus(textLength: number) {
    const editorComponent = this.__getEditorComponent();
    if (!editorComponent) return;

    editorComponent.focus();
    editorComponent.setSelectionRange(textLength);
  }
}

export default new ChatInputListener();
