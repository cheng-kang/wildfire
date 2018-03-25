import VueResource from 'vue-resource';
import wilddog from 'wilddog';
import VueWild from 'vuewild';
import bus from './common/bus';
import initLocalComponents from './common/init-local-components';
import iView from './common/load-iview';
import dateFns from './common/load-date-fns';
import i18next, { initI18next, resetI18next } from './common/load-i18next';
import { defaultPageURL, b64EncodeUnicode } from './utils';
import Wildfire from './Wildfire';
import './assets/style.css';
import './assets/style.dark.css';
import './assets/animation.css';

export const install = (_Vue, config) => {
  // Init wildfire components
  initLocalComponents(_Vue);

  if (!_Vue.http) { _Vue.use(VueResource); }

  _Vue.use(iView);

  const {
    // databaseProvider = 'wilddog',
    databaseConfig,
    standbyDatabaseConfigs = [],

    pageTitle = document.title,
    pageURLMode = 'normal',

    theme = 'light',
    locale = 'en',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',
  } = config;

  let { pageURL } = config;

  /**
   * ! calk
   */
  if (!pageURL) pageURL = defaultPageURL(pageURLMode);

  initI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);

  const wf = {
    config: {
      databaseProvider: 'wilddog',
      databaseConfig,
      standbyDatabaseConfigs,
      pageTitle,
      pageURL: b64EncodeUnicode(pageURL),
      pageURLMode,
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous',
    },
    i18next,
    formatDate,
    distanceInWordsToNow,
  };

  if (!_Vue.$bindAsObject) { _Vue.use(VueWild); }
  wf.dbApp = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
  }, `wildfire-${databaseConfig.siteId}`);
  wf.db = wf.dbApp.sync();
  wf.auth = wf.dbApp.auth();
  wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential;

  // ToFix: 过多使用 assign 导致难以维护 bus
  // 1、只在其他组件中动态添加【需要全局使用的变化状态值】；
  // 2、其他需要全局使用的变量，应当通过utils，或者在bus中内部定义，不应当动态添加
  Object.assign(bus, wf);

  _Vue.component('wildfire', Wildfire);
};

export const reset = (_Vue, config = {}, err) => {
  const getDatabaseConfig = () => {
    const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = bus.config;
    if (standbyDatabaseConfigs.length === 0 || !err || err.code !== 26107) {
      return databaseConfig;
    }
    const currentConfigIdx = standbyDatabaseConfigs.findIndex(aConfig => (databaseProvider === 'firebase' ? aConfig.projectId === databaseConfig.projectId : aConfig.siteId === databaseConfig.siteId));
    if (currentConfigIdx === -1 || currentConfigIdx === standbyDatabaseConfigs.length - 1) {
      return standbyDatabaseConfigs[0];
    }
    return standbyDatabaseConfigs[currentConfigIdx + 1];
  };

  const {
    databaseProvider = bus.config.databaseProvider,
    standbyDatabaseConfigs = bus.config.standbyDatabaseConfigs,
    pageTitle = document.title,
    pageURLMode = bus.config.pageURLMode,
    theme = bus.config.theme,
    locale = bus.config.locale,
    defaultAvatarURL = bus.config.defaultAvatarURL,
  } = config;

  let { databaseConfig, pageURL } = config;

  if (!databaseConfig) databaseConfig = getDatabaseConfig();
  if (!pageURL) pageURL = defaultPageURL(pageURLMode);

  resetI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);

  const wf = {
    config: {
      databaseProvider,
      databaseConfig,
      standbyDatabaseConfigs,
      pageTitle,
      pageURL: b64EncodeUnicode(pageURL),
      pageURLMode,
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous',
    },
    formatDate,
    distanceInWordsToNow,
  };

  wf.dbApp = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
  }, `wildfire-${databaseConfig.siteId}`);
  wf.db = wf.dbApp.sync();
  wf.auth = wf.dbApp.auth();
  wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential;

  Object.assign(bus, wf);
};

export default { install, reset };
