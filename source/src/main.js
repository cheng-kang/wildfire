import Vue from 'vue'
import VueResource from 'vue-resource'
import wilddog from 'wilddog'
import VueWild from 'vuewild'
import firebase from 'firebase'
import VueFire from 'vuefire'
import moment from 'moment'
import i18next from 'i18next'
import iView from './common/loadiView'
import App from './App'
import './assets/style.css'

// ↓Should be `false` in production
Vue.config.productionTip = true

/*
  Testing configs
 */
const wildfireConfig = {
  databaseProvider: 'wilddog',
  databaseConfig: {
    siteId: 'wd2168973289ifdmcg'
  },
  pageURL: 'http://chengkang.me/wildfire',
  pageTitle: 'Wildfire Demo',
  locale: 'en'
  // locale: 'zh-CN'
}

// const wildfireConfig = {
//   databaseProvider: 'firebase',
//   databaseConfig: {
//     apiKey: 'AIzaSyB39UJBnIUYAQxu3zKkpyzjTZDDfHt7lzc',
//     authDomain: 'wild-fire-ee770.firebaseapp.com',
//     databaseURL: 'https://wild-fire-ee770.firebaseio.com',
//     projectId: 'wild-fire-ee770',
//     storageBucket: 'wild-fire-ee770.appspot.com',
//     messagingSenderId: '655484997793'
//   },
//   pageURL: 'http://chengkang.me/wildfire',
//   pageTitle: 'Wildfire Demo',
//   locale: 'zh-CN'
// }

const {
  databaseProvider,
  databaseConfig, // required
  pageTitle = document.title,
  pageURL = window.location.href,
  locale = 'en'
} = wildfireConfig
/*
  End of: Testing configs
 */

// Init configs from global configuration object
// const {
//   databaseProvider,
//   databaseConfig, // required
//   pageTitle = document.title,
//   pageURL = window.location.href,
//   locale = 'en'
// } = window.wildfireConfig()

Vue.prototype.$config = {
  databaseProvider,
  databaseConfig,
  pageTitle,
  pageURL: btoa(pageURL), // encode pageURL with base64
  locale,
  defaultAvatarURL: 'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/firefighter-avatar.png',
  anonymousUserId: 'Anonymous'
}
Vue.prototype.$i18next = i18next
Vue.prototype.$moment = moment

Vue.use(VueResource)
Vue.use(iView)

if (databaseProvider === 'wilddog') {
  Vue.use(VueWild)
  Vue.prototype.$app = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`
  })
  Vue.prototype.$database = Vue.prototype.$app.sync()
  Vue.prototype.$auth = Vue.prototype.$app.auth()
} else if (databaseProvider === 'firebase') {
  Vue.use(VueFire)
  Vue.prototype.$app = firebase.initializeApp(databaseConfig)
  Vue.prototype.$database = Vue.prototype.$app.database()
  Vue.prototype.$auth = Vue.prototype.$app.auth()
}

/*
  Get current client IP address
 */
Vue.prototype.$ip = 'unknown'
Vue.http.get('https://api.ipify.org?format=json').then(response => {
  Vue.prototype.$ip = response.body.ip
}, response => {
  // error callback
  console.log(response)
  Vue.prototype.$ip = 'unknown-failed'
})

/*
  Init moment.js locale
    note: the locale string should be lowercase
 */
moment.locale(locale.toLowerCase())

/*
  Init i18next for internationalization
 */
import {
  langEn,
  langZhCN
} from './common/translation'
console.log(langEn)
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

/*
  Init Wildfire Application
    note: should disable eslint `no-new`
 */
/* eslint-disable no-new */
new Vue({
  el: '#wildfire',
  template: '<App/>',
  components: { App }
})
