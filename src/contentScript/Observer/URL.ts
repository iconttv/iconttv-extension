class URLObserver {
  static #instance: URLObserver;

  url!: string;
  observer!: MutationObserver;
  callbacks!: (() => void)[];

  constructor() {
    // biome-ignore lint/correctness/noConstructorReturn: <explanation>
    if (URLObserver.#instance) return URLObserver.#instance;
    URLObserver.#instance = this;

    this.url = window.location.href;
    this.callbacks = [];
    this.observer = new MutationObserver(() => {
      if (this.url !== window.location.href) {
        this.url = window.location.href;
        this.callbacks.map((cb) => cb());
      }
    });
    this.observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  on(callback: () => void) {
    this.callbacks = [...this.callbacks, callback];
  }

  off(callback: () => void) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }
}

export default new URLObserver();
