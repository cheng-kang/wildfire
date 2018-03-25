import VueResource from 'vue-resource';
import firebase from 'firebase';
import VueFire from 'vuefire';
import bus from './common/bus';
import initLocalComponents from './common/init-local-components';
import iView from './common/load-iview';
import dateFns from './common/load-date-fns';
import i18next, { initI18next, resetI18next } from './common/load-i18next';
import { b64EncodeUnicode, b64DecodeUnicode, defaultPageURL } from './utils';
import Wildfire from './Wildfire';
import './assets/style.css';
import './assets/style.dark.css';
import './assets/animation.css';

export const install = (_Vue, config) => {
  initLocalComponents(_Vue);

  if (!_Vue.http) { _Vue.use(VueResource); }

  _Vue.use(iView);

  const {
    // databaseProvider = 'firebase',
    databaseConfig,
    standbyDatabaseConfigs = [],

    pageTitle = document.title,
    pageURLMode = 'normal',

    theme = 'light',
    locale = 'en',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',

    plugins = [],
  } = config;

  let { pageURL } = config;

  if (!pageURL) pageURL = defaultPageURL(pageURLMode);

  initI18next(locale);

  const { formatDate, distanceInWordsToNow } = dateFns(locale);

  const wf = {
    config: {
      databaseProvider: 'firebase',
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
    plugins,
    pluginComponents: {},
    pluginOptions: {},
    events: {},
  };

  if (!_Vue.$bindAsObject) { _Vue.use(VueFire); }
  wf.dbApp = firebase.initializeApp(databaseConfig, `wildfire-${databaseConfig.projectId}`);
  wf.db = wf.dbApp.database();
  wf.auth = wf.dbApp.auth();
  wf.authService = firebase.auth.EmailAuthProvider.credential;

  wf.b64EncodeUnicode = b64EncodeUnicode;
  wf.b64DecodeUnicode = b64DecodeUnicode;

  Object.assign(bus, wf);

  plugins.forEach(plugin => {
    plugin.install({
      registerComponent: (componentName, component) => _Vue.component(componentName, component),
      i18n: (lang, translation) => addTranslation(lang, translation),
      renderAt: (place, componentName) => (
        bus.pluginComponents[place]
          ? bus.pluginComponents[place].push(componentName)
          : Object.assign(bus.pluginComponents, { [place]: [componentName] })
      ),
    });
    Object.keys(plugin.on || {}).forEach(eventName => {
      const eventFn = plugin.on[eventName];
      if (bus.events[eventName]) {
        bus.events[eventName].push(eventFn);
      } else {
        Object.assign(bus.events, { [eventName]: [eventFn] });
      }
    });
    Object.assign(bus.pluginOptions, { [plugin.name]: plugin.options });
  });

  _Vue.component('wildfire', Wildfire);
};

export const reset = (_Vue, config = {}, err) => {
  const getDatabaseConfig = () => {
    const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = bus.config;
    if (
      standbyDatabaseConfigs.length === 0
      || !err
      || err.code !== 26107
    ) return databaseConfig;
    const currentConfigIdx = standbyDatabaseConfigs.findIndex(aConfig => (databaseProvider === 'firebase' ? aConfig.projectId === databaseConfig.projectId : aConfig.siteId === databaseConfig.siteId));
    if (
      currentConfigIdx === -1
      || currentConfigIdx === standbyDatabaseConfigs.length - 1
    ) return standbyDatabaseConfigs[0];
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
    plugins = bus.plugins,
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
    plugins,
    pluginComponents: {},
    pluginOptions: {},
    events: {},
  };

  const appName = `wildfire-${databaseConfig.projectId}`;
  wf.dbApp = (
    firebase.apps.find(app => app.name === appName)
    || firebase.initializeApp(databaseConfig, appName)
  );
  wf.db = wf.dbApp.database();
  wf.auth = wf.dbApp.auth();
  wf.authService = firebase.auth.EmailAuthProvider.credential;

  Object.assign(bus, wf);

  plugins.forEach(plugin => {
    plugin.install({
      registerComponent: (componentName, component) => (
        !_Vue.options.components[componentName]
        && _Vue.component(componentName, component)
      ),
      i18n: (lang, translation) => addTranslation(lang, translation),
      renderAt: (place, componentName) => (
        bus.pluginComponents[place]
          ? bus.pluginComponents[place].push(componentName)
          : Object.assign(bus.pluginComponents, { [place]: [componentName] })
      ),
    });
    Object.keys(plugin.on || {}).forEach(eventName => {
      const eventFn = plugin.on[eventName];
      if (bus.events[eventName]) {
        bus.events[eventName].push(eventFn);
      } else {
        Object.assign(bus.events, { [eventName]: [eventFn] });
      }
    });
    Object.assign(bus.pluginOptions, { [plugin.name]: plugin.options });
  });
};

export default { install, reset };
