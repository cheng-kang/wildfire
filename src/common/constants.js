import avatarImage from '../assets/images/avatar.svg';

export const ANONYMOUS_USER_ID = 'Anonymous';

export const LOCALE = {
  EN: 'en',
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const PAGE_URL_MODE = {
  NORMAL: 'normal',
  HASH: 'hash',
  FULL: 'full',
};

export const DEFAULT = {
  ANONYMOUS_USER_ID,
  AVATAR_URL: avatarImage,
  LOCALE: LOCALE.EN,
  THEME: THEME.LIGHT,
  PAGE_URL_MODE: PAGE_URL_MODE.NORMAL,
};

export const PLUGIN_LIST_CDN = 'https://unpkg.com/wf-plugin-center';
