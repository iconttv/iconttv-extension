import Iconttv from '../contentScript/Iconttv';

export {};

/**
 * specify type for autocomplete variables in development.
 */
declare global {
  interface Window {
    __iconttv: boolean;
    iconttv: Iconttv;
  }
}
