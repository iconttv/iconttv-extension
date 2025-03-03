import SafeEventEmitter from '@metamask/safe-event-emitter';
// import TWITCH_SELECTORS from '../utils/selectors';
import LocalStorage, { STORAGE_KEY } from '../LocalStorage';

export const ChatInputListenerEventTypes = {
  // 채팅창에 새로운 입력 값 추가됨
  NEW_VALUE: 'new_value',
};

class ChatInputListener extends SafeEventEmitter {
  static #instance: ChatInputListener;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  inputComponent: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  editorComponent: any;

  constructor() {
    super();

    // biome-ignore lint/correctness/noConstructorReturn: <explanation>
    if (ChatInputListener.#instance) return ChatInputListener.#instance;
    ChatInputListener.#instance = this;

    this.inputComponent = null;
    this.editorComponent = null;

    this.on(ChatInputListenerEventTypes.NEW_VALUE, (text: string) => {
      LocalStorage.cache.set(STORAGE_KEY.CACHE.CHAT_INPUT, text);
    });
  }

  __getReactInstance(selector: string) {
    const element = document.querySelector(selector);
    if (!element) return null;

    for (const key in element) {
      if (key.startsWith('__reactInternalInstance')) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return (element as any)[key];
      }
    }
    return null;
  }

  __getReactComponent(
    selector: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
      window.iconttv.domSelector.chatInput,
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
      window.iconttv.domSelector.chatInput,
      (elem) => elem.stateNode?.state?.slateEditor != null
    )?.stateNode;

    return this.editorComponent;
  }

  /**
   * 일단 버그가 많음.
   */
  unstable_getStreamerName(): string {
    const editorComponent = this.__getEditorComponent();
    if (!editorComponent) return '';

    return editorComponent.props.channelLogin ?? '';
  }

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
  getInputValue(): string {
    const chatInput = document.querySelector(
      window.iconttv.domSelector.chatInput
    );
    if (!chatInput) return '';
    return (chatInput as HTMLDivElement).innerText;
  }

  unstable_getInputValue(): string {
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

    const inputComponent = this.__getInputComponent();
    if (!inputComponent) return '';
    return this.inputComponent.memoizedProps.value;
  }

  /**
   * 입력 값을 `text`로 대체
   *
   * @param text
   * @param setFocus
   * @returns
   */
  setInputValue(text: string, setFocus = true) {
    const inputComponent = this.__getInputComponent();
    if (!inputComponent) return;

    inputComponent.memoizedProps.value = text;
    inputComponent.memoizedProps.setInputValue(text);
    inputComponent.memoizedProps.onValueUpdate(text);

    this.emit(ChatInputListenerEventTypes.NEW_VALUE, text);

    if (setFocus) this.setFocus(text.length);
  }

  /**
   * 현재 입력 값에 추가
   *
   * @param text
   * @param setFocus
   * @param fromSearch
   * @returns
   */
  appendInputValue(text: string, setFocus = true, fromSearch = false) {
    const inputComponent = this.__getInputComponent();
    if (!inputComponent) return;

    /**
     * 검색 결과로 추가하는거면
     * 이전 입력과 공백 없이 이어서 추가해야 함.
     */
    const nextText = `${inputComponent.memoizedProps.value}${
      fromSearch ? '' : ' '
    }${text} `;

    this.setInputValue(nextText, setFocus);
  }

  setFocus(textLength: number) {
    const editorComponent = this.__getEditorComponent();
    if (!editorComponent) return;

    /**
     * setTimeout으로 감싸야 focus가 동작함
     */
    setTimeout(() => {
      editorComponent.focus();
      editorComponent.setSelectionRange(textLength);
    }, 0);
  }
}

export default new ChatInputListener();
