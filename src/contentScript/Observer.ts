import { TwitchSelectors } from './utils/selectors';

export interface ObserverCallbackWrapper<T> {
  result: T | null;
}

class Observer {
  static #instance: Observer;

  observer!: MutationObserver;
  callbacks!: Partial<Record<TwitchSelectors, ((node: Element) => void)[]>>;

  constructor() {
    if (Observer.#instance) return Observer.#instance;
    Observer.#instance = this;

    this.callbacks = {};
    this.observer = new MutationObserver((mutations) => {
      if (this.callbacks === undefined) return;

      // mutations.target: parent of addedNodes
      for (const { addedNodes, target } of mutations) {
        const targetElement = target as Element;
        const addedElements = Array.from(addedNodes) as Element[];

        for (const selectorString in this.callbacks) {
          const selector = <TwitchSelectors>selectorString;
          addedElements
            .filter(
              (element) => 'matches' in element && element.matches(selector)
            )
            .forEach((element) =>
              this.callbacks[selector]?.map((cb) => cb(element))
            );

          if (addedNodes.length === 0) {
            if ('matches' in targetElement && targetElement.matches(selector)) {
              this.callbacks[selector]?.map((cb) => cb(targetElement));
            }

            const children = targetElement.querySelectorAll(selector);
            children.forEach((child) => {
              this.callbacks[selector]?.map((cb) => cb(child));
            });
          }
        }
      }
    });
    this.observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  on(selector: TwitchSelectors, callback: (node: Element) => void) {
    const prev = this.callbacks[selector] ?? [];
    this.callbacks[selector] = [...prev, callback];
  }

  off(selector: TwitchSelectors, callback: (node: Element) => void) {
    const prev = this.callbacks[selector] ?? [];
    this.callbacks[selector] = prev.filter((cb) => cb !== callback);
  }
}

export default new Observer();
