import firebase from 'firebase';
import VueFire from 'vuefire';
import wilddog from 'wilddog';
import VueWild from 'vuewild';
import { DEFAULT } from "./constants";
import dateFns from '../modules/date-fns';
import i18next, { initI18next, resetI18next } from '../modules/i18next';
import { b64EncodeUnicode, b64DecodeUnicode, defaultPageURL } from '../utils';
import { PCM, PHM, PTM, PTM4Meta } from '../plugin';

class WfButler {
  constructor() {
    this.config = {};
    this.i18next = i18next;
    this.dbApp = undefined;
    this.db = undefined;
    this.auth = undefined;
    this.authService = undefined;
    this.formatDate = undefined;
    this.distanceInWordsToNow = undefined;
    this.b64EncodeUnicode = b64EncodeUnicode;
    this.b64DecodeUnicode = b64DecodeUnicode;
  }

  initService(Vue, { databaseProvider, databaseConfig }, isReset) {
    if (databaseProvider === 'firebase') {
      // TODO: test Vue.use(samething twice)
      Vue.use(VueFire);
      if (isReset) {
        const appName = `wildfire-${databaseConfig.projectId}`;
        this.dbApp = (
          firebase.apps.find(app => app.name === appName)
          || firebase.initializeApp(databaseConfig, appName)
        );
      } else {
        this.dbApp = firebase.initializeApp(databaseConfig, `wildfire-${databaseConfig.projectId}`);
      }
      this.db = this.dbApp.database();
      this.auth = this.dbApp.auth();
      this.authService = firebase.auth.EmailAuthProvider.credential;
    } else if (databaseProvider === 'wilddog') {
      Vue.use(VueWild);
      this.dbApp = wilddog.initializeApp({
        authDomain: `${databaseConfig.siteId}.wilddog.com`,
        syncURL: `https://${databaseConfig.siteId}.wilddogio.com`,
      }, `wildfire-${databaseConfig.siteId}`);
      this.db = this.dbApp.sync();
      this.auth = this.dbApp.auth();
      this.authService = wilddog.auth.WilddogAuthProvider.emailCredential;
    }
  }

  // TODO: Props Check
  initApp(Vue, {
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs = [],

    pageTitle = document.title,
    pageURLMode = DEFAULT.PAGE_URL_MODE,
    pageURL = defaultPageURL(pageURLMode),

    theme = DEFAULT.THEME,
    locale = DEFAULT.LOCALE,
    defaultAvatarURL = DEFAULT.AVATAR_URL,
  }) {
    this.config = {
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
    this.formatDate = formatDate;
    this.distanceInWordsToNow = distanceInWordsToNow;

    this.initService(Vue, { databaseProvider, databaseConfig })
  }

  resetApp(Vue, config = {}, err) {
    const getDatabaseConfig = () => {
      const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = this.config;
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
      databaseProvider = this.config.databaseProvider,
      databaseConfig = getDatabaseConfig(),
      standbyDatabaseConfigs = this.config.standbyDatabaseConfigs,
      pageTitle = document.title,
      pageURLMode = this.config.pageURLMode,
      pageURL = defaultPageURL(pageURLMode),
      theme = this.config.theme,
      locale = this.config.locale,
      defaultAvatarURL = this.config.defaultAvatarURL,
    } = config;

    this.config = {
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
    this.formatDate = formatDate;
    this.distanceInWordsToNow = distanceInWordsToNow;
  
    this.initService(Vue, { databaseProvider, databaseConfig }, true)
  }
}

const butler = new WfButler();

export default butler; 