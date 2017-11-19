import VueResource from 'vue-resource'
import wilddog from 'wilddog'
import VueWild from 'vuewild'
import moment from 'moment'
import i18next from 'i18next'
import {
  langEn,
  langZhCN
} from './common/translation'
import iView from './common/loadiView'
import Wildfire from './Wildfire'
import './assets/style.css'
import './assets/style.dark.css'
import './assets/animation.css'

const install = (_Vue, config) => {
  const {
    // databaseProvider = 'wilddog',
    databaseConfig, // required
    pageTitle = document.title,
    pageURL = window.location.href,
    theme = 'light',
    locale = 'en',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg'
  } = config

  const wf = {
    config: {
      databaseProvider: 'wilddog',
      databaseConfig,
      pageTitle,
      pageURL: btoa(pageURL), // encode pageURL with base64
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous'
    },
    info: {ip: 'unknown', isBanned: false},
    i18next,
    moment
  }

  if (!_Vue.http) { _Vue.use(VueResource) }

  _Vue.use(iView)

  if (!_Vue.$bindAsObject) { _Vue.use(VueWild) }
  wf.dbApp = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`
  })
  wf.db = wf.dbApp.sync()
  wf.auth = wf.dbApp.auth()
  wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential

  _Vue.prototype.$_wf = wf

  moment.locale(locale.toLowerCase())

  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: langEn
      },
      'zh-CN': {
        translation: langZhCN
      }
    }
  }, (err, t) => {
    if (err) {
      console.error(err)
    } else {
      console.log('i18next Initialized!')
    }
  })

  _Vue.component('wildfire', Wildfire)
}

export default {install}
