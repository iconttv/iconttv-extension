import Logger from '../../Logger';
import { DOMSelectorValue } from '../constants/selector';

class DOMObserver {
  static #instance: DOMObserver;

  isActivate!: boolean;
  observer!: MutationObserver;
  callbacks!: Partial<Record<DOMSelectorValue, ((node: Element) => void)[]>>;

  constructor() {
    if (DOMObserver.#instance) return DOMObserver.#instance;
    DOMObserver.#instance = this;

    this.isActivate = true;
    this.callbacks = {};
    this.observer = new MutationObserver((mutations) => {
      if (!this.isActivate) return;
      if (Object.keys(this.callbacks).length === 0) return;

      // mutations.target: parent of addedNodes
      for (const { addedNodes, target } of mutations) {
        const targetElement = target as Element;
        const addedElements = Array.from(addedNodes) as Element[];

        for (const selectorString in this.callbacks) {
          const selector = <DOMSelectorValue>selectorString;
          addedElements
            .filter(
              (element) => 'matches' in element && element.matches(selector)
            )
            .forEach((element) =>
              this.callbacks[selector]?.map((cb) => cb(element))
            );

          if ('matches' in targetElement && targetElement.matches(selector)) {
            this.callbacks[selector]?.map((cb) => cb(targetElement));
          }

          const children = targetElement.querySelectorAll(selector);
          children.forEach((child) => {
            this.callbacks[selector]?.map((cb) => cb(child));
          });
        }
      }
    });
    this.observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  on(selector: DOMSelectorValue, callback: (node: Element) => void) {
    const prev = this.callbacks[selector] ?? [];
    this.callbacks[selector] = [...prev, callback];
  }

  off(selector: DOMSelectorValue, callback: (node: Element) => void) {
    const prev = this.callbacks[selector] ?? [];
    this.callbacks[selector] = prev.filter((cb) => cb !== callback);
  }

  activate() {
    Logger.debug(`observer enabled`);
    this.isActivate = true;
  }
  deactivate() {
    Logger.debug(`observer disabled`);
    this.isActivate = false;
  }
}

export default new DOMObserver();
