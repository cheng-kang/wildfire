import VueResource from 'vue-resource';
import wilddog from 'wilddog';
import VueWild from 'vuewild';
import firebase from 'firebase';
import VueFire from 'vuefire';
import Bus from './common/bus';
import initLocalComponents from './common/initLocalComponents';
import iView from './common/loadiView';
import dateFns from './common/loadDateFns';
import i18next, { initI18next, resetI18next } from './common/loadI18next';
import { b64EncodeUnicode, b64DecodeUnicode, defaultPageURL } from './common/utils';
import Wildfire from './Wildfire';
import './assets/style.css';
import './assets/style.dark.css';
import './assets/animation.css';

export const install = (_Vue, config) => {
  initLocalComponents(_Vue);

  if (!_Vue.http) { _Vue.use(VueResource); }

  _Vue.use(iView);

  const {
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs = [],

    pageTitle = document.title,
    pageURLMode = 'normal',

    theme = 'light',
    locale = 'en',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',
  } = config;

  let { pageURL } = config;

  if (!pageURL) pageURL = defaultPageURL(pageURLMode);

  initI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);

  const wf = {
    config: {
      databaseProvider,
      databaseConfig,
      standbyDatabaseConfigs,
      pageTitle,
      pageURL: b64EncodeUnicode(pageURL), // encode pageURL with base64
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

  if (databaseProvider === 'firebase') {
    if (!_Vue.$bindAsObject) { _Vue.use(VueFire); }
    wf.dbApp = firebase.initializeApp(databaseConfig, `wildfire-${databaseConfig.projectId}`);
    wf.db = wf.dbApp.database();
    wf.auth = wf.dbApp.auth();
    wf.authService = firebase.auth.EmailAuthProvider.credential;
  } else if (databaseProvider === 'wilddog') {
    if (!_Vue.$bindAsObject) { _Vue.use(VueWild); }
    wf.dbApp = wilddog.initializeApp({
      authDomain: `${databaseConfig.siteId}.wilddog.com`,
      syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
    }, `wildfire-${databaseConfig.siteId}`);
    wf.db = wf.dbApp.sync();
    wf.auth = wf.dbApp.auth();
    wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential;
  }

  wf.b64EncodeUnicode = b64EncodeUnicode;
  wf.b64DecodeUnicode = b64DecodeUnicode;

  // TODO:
  // Should Not modify Bus dynamically here.
  // The Bus should only have fixed fields.
  Object.assign(Bus, wf);

  _Vue.component('wildfire', Wildfire);
};

export const reset = (_Vue, config = {}, err) => {
  const getDatabaseConfig = () => {
    const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = Bus.config;
    if (standbyDatabaseConfigs.length === 0 || !err || err.code !== 26107) return databaseConfig;
    const currentConfigIdx = standbyDatabaseConfigs.findIndex(config => (databaseProvider === 'firebase' ? config.projectId === databaseConfig.projectId : config.siteId === databaseConfig.siteId));
    if (
      currentConfigIdx === -1
      || currentConfigIdx === standbyDatabaseConfigs.length - 1
    ) return standbyDatabaseConfigs[0];
    return standbyDatabaseConfigs[currentConfigIdx + 1];
  };

  const {
    databaseProvider = Bus.config.databaseProvider,
    standbyDatabaseConfigs = Bus.config.standbyDatabaseConfigs,
    pageTitle = document.title,
    pageURLMode = Bus.config.pageURLMode,
    theme = Bus.config.theme,
    locale = Bus.config.locale,
    defaultAvatarURL = Bus.config.defaultAvatarURL,
  } = config;

  let { databaseConfig, pageURL } = config;
  const { pluginCenter } = Bus;

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
      pageURLMode,
      pageURL: b64EncodeUnicode(pageURL), // encode pageURL with base64
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous',
    },
    formatDate,
    distanceInWordsToNow,
    pluginCenter,
  };

  if (databaseProvider === 'firebase') {
    if (!_Vue.$bindAsObject) { _Vue.use(VueFire); }
    const appName = `wildfire-${databaseConfig.projectId}`;
    wf.dbApp = (
      firebase.apps.find(app => app.name === appName)
      || firebase.initializeApp(databaseConfig, appName)
    );
    wf.db = wf.dbApp.database();
    wf.auth = wf.dbApp.auth();
    wf.authService = firebase.auth.EmailAuthProvider.credential;
  } else if (databaseProvider === 'wilddog') {
    if (!_Vue.$bindAsObject) { _Vue.use(VueWild); }
    wf.dbApp = wilddog.initializeApp({
      authDomain: `${databaseConfig.siteId}.wilddog.com`,
      syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
    }, `wildfire-${databaseConfig.siteId}`);
    wf.db = wf.dbApp.sync();
    wf.auth = wf.dbApp.auth();
    wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential;
  }

  Object.assign(Bus, wf);
};

export default { install, reset };
