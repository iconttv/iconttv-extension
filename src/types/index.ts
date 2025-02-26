import type Iconttv from '../contentScript/Iconttv';

/**
 * specify type for autocomplete variables in development.
 */
declare global {
  interface Window {
    __iconttv: boolean;
    iconttv: Iconttv;
  }
}
