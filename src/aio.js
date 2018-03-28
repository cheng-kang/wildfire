import firebase from 'firebase';
import VueFire from 'vuefire';
import wilddog from 'wilddog';
import VueWild from 'vuewild';
import init from './init';
import { butler, DEFAULT } from './common';
import dateFns from './modules/date-fns';
import { initI18next, resetI18next } from './modules/i18next';
import { b64EncodeUnicode, defaultPageURL } from './utils';
import { PCM, PHM, PTM, PTM4Meta } from './plugin';

const initService = (Vue, { databaseProvider, databaseConfig }, isReset) => {
  if (databaseProvider === 'firebase') {
    // TODO: test Vue.use(samething twice)
    Vue.use(VueFire);
    if (isReset) {
      const appName = `wildfire-${databaseConfig.projectId}`;
      butler.dbApp = (
        firebase.apps.find(app => app.name === appName)
        || firebase.initializeApp(databaseConfig, appName)
      );
    } else {
      butler.dbApp = firebase.initializeApp(databaseConfig, `wildfire-${databaseConfig.projectId}`);
    }
    butler.db = butler.dbApp.database();
    butler.auth = butler.dbApp.auth();
    butler.authService = firebase.auth.EmailAuthProvider.credential;
  } else if (databaseProvider === 'wilddog') {
    Vue.use(VueWild);
    butler.dbApp = wilddog.initializeApp({
      authDomain: `${databaseConfig.siteId}.wilddog.com`,
      syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
    }, `wildfire-${databaseConfig.siteId}`);
    butler.db = butler.dbApp.sync();
    butler.auth = butler.dbApp.auth();
    butler.authService = wilddog.auth.WilddogAuthProvider.emailCredential;
  }
}

export const install = (Vue, {
  databaseProvider,
  databaseConfig,
  standbyDatabaseConfigs = [],

  pageTitle = document.title,
  pageURLMode = DEFAULT.PAGE_URL_MODE,
  pageURL = defaultPageURL(pageURLMode),

  theme = DEFAULT.THEME,
  locale = DEFAULT.LOCALE,
  defaultAvatarURL = DEFAULT.AVATAR_URL,
}) => {
  butler.config = {
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs,
    pageTitle,
    pageURL: b64EncodeUnicode(pageURL),
    pageURLMode,
    locale,
    theme,
    defaultAvatarURL,
    anonymousUserId: DEFAULT.ANONYMOUS_USER_ID,
  }
  
  initI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);
  butler.formatDate = formatDate;
  butler.distanceInWordsToNow = distanceInWordsToNow;

  initService(Vue, { databaseProvider, databaseConfig });

  init(Vue);
};

export const reset = (Vue, config = {}, err) => {
  const getDatabaseConfig = () => {
    const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = butler.config;
    if (standbyDatabaseConfigs.length === 0 || !err || err.code !== 26107) return databaseConfig;
    const currentConfigIdx = standbyDatabaseConfigs.findIndex(config => (databaseProvider === 'firebase' ? config.projectId === databaseConfig.projectId : config.siteId === databaseConfig.siteId));
    if (
      currentConfigIdx === -1
      || currentConfigIdx === standbyDatabaseConfigs.length - 1
    ) return standbyDatabaseConfigs[0];
    return standbyDatabaseConfigs[currentConfigIdx + 1];
  };

  // TODO: empty Plugin related thing!!!
  PCM.reset()
  PHM.reset()
  PTM.reset()
  PTM4Meta.reset()

  const {
    databaseProvider = butler.config.databaseProvider,
    databaseConfig = getDatabaseConfig(),
    standbyDatabaseConfigs = butler.config.standbyDatabaseConfigs,
    pageTitle = document.title,
    pageURLMode = butler.config.pageURLMode,
    pageURL = defaultPageURL(pageURLMode),
    theme = butler.config.theme,
    locale = butler.config.locale,
    defaultAvatarURL = butler.config.defaultAvatarURL,
  } = config;

  butler.config = {
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs,
    pageTitle,
    pageURL: b64EncodeUnicode(pageURL),
    pageURLMode,
    locale,
    theme,
    defaultAvatarURL,
    anonymousUserId: DEFAULT.ANONYMOUS_USER_ID,
  }

  resetI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);
  butler.formatDate = formatDate;
  butler.distanceInWordsToNow = distanceInWordsToNow;

  butler.initService(Vue, { databaseProvider, databaseConfig }, true)
};

export default { install, reset };
