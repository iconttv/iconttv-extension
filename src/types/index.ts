export {};

/**
 * 개발 시에 vscode에서 타입 인식하기 위함.
 */
declare global {
  interface Window {
    __iconttv?: boolean;
    iconttv?: any;
  }
}
