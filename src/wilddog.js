import VueResource from 'vue-resource'
import wilddog from 'wilddog'
import VueWild from 'vuewild'
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
import { distanceInWordsToNow, format } from 'date-fns'
import zhLocale from 'date-fns/locale/zh_cn'
import enLocale from 'date-fns/locale/en'
const getLocaleObject = (locale) => {
  const lcl = locale.toLowerCase().split('-')[0]
  if (lcl === 'zh') {
    return zhLocale
  }

  return enLocale
}
import { b64EncodeUnicode, b64DecodeUnicode } from './common/utils'

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

  const localeObject = getLocaleObject(locale)

  const wf = {
    config: {
      databaseProvider: 'wilddog',
      databaseConfig,
      pageTitle,
      pageURL: b64EncodeUnicode(pageURL), // encode pageURL with base64
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous'
    },
    info: {ip: 'unknown', isBanned: false},
    i18next,
    formatDate: (date) => format(date, 'YYYY-MM-DD HH:mm:ss', { locale: localeObject, addSuffix: true }),
    distanceInWordsToNow: (date) => distanceInWordsToNow(date, { locale: localeObject, addSuffix: true })
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

  wf.b64EncodeUnicode = b64EncodeUnicode
  wf.b64DecodeUnicode = b64DecodeUnicode

  _Vue.prototype.$_wf = wf

  // Dynamically update `pageTitle` & `pageURL`
  _Vue.prototype.$_updateWildfirePageInfo = function ({ pageTitle, pageURL }) {
    if (pageTitle) { this.$_wf.config.pageTitle = pageTitle }
    if (pageURL) { this.$_wf.config.pageURL = b64EncodeUnicode(pageURL) }
  }

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
