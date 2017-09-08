
// const wildfireConfig = {
//   database: 'firebase',
//   databaseConfig: {
//     apiKey: 'AIzaSyCLsuRlCYjLyetc40v0-yFKHZVhumi85bs',
//     authDomain: 'wildfirewebsite-35a4f.firebaseapp.com',
//     databaseURL: 'https://wildfirewebsite-35a4f.firebaseio.com',
//     projectId: 'wildfirewebsite-35a4f',
//     storageBucket: '',
//     messagingSenderId: '911552849262'
//   },
//   siteId: 'wildfire',
//   pageURL: 'http://chengkang.me/wildfire',
//   pageTitle: 'Wildfire Demo',
//   locale: 'zh-cn'
// }
const {
  database = 'firebase',
  databaseConfig, // required
  siteId, // required
  pageTitle = document.title,
  pageURL = window.location.href,
  locale = 'en'
} = window.wildfireConfig

window._wildfire = {
  currentUser: null,
  config: {
    database,
    databaseConfig,
    siteId,
    pageTitle,
    pageURL,
    locale,
    defaultAvatar: 'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/firefighter-avatar.png',
    anonymousUserId: 'anonymous'
  }
}
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import firebase from 'firebase'
import moment from 'moment'
import VueFire from 'vuefire'
import i18next from 'i18next'

Vue.config.productionTip = true
Vue.use(VueFire)
Vue.prototype.$i18next = i18next
Vue.prototype.$moment = moment

// const { locale, siteId } = window._wildfire.config

var config = {
  apiKey: 'AIzaSyB39UJBnIUYAQxu3zKkpyzjTZDDfHt7lzc',
  authDomain: 'wild-fire-ee770.firebaseapp.com',
  databaseURL: 'https://wild-fire-ee770.firebaseio.com',
  projectId: 'wild-fire-ee770',
  storageBucket: 'wild-fire-ee770.appspot.com',
  messagingSenderId: '655484997793'
}
window._wildfire.userApp = firebase.initializeApp(config, 'userApp')

window._wildfire.userApp.database().ref('/sites/' + siteId).once('value').then((snapshot) => {
  const result = snapshot.val()
  if (!result) {
    console.log('Site Exist.')
    return
  }

  console.error('Site Does Not Exist!')
  return
})

moment.locale(locale, {
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '几秒',
    ss: '%d 秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  }
})

const _locale = locale === 'zh-cn' ? 'zh' : locale
i18next.init({
  lng: _locale,
  debug: true,
  resources: {
    en: {
      translation: {
        'button/reply': 'Reply',
        'button/cancel': 'Cancel',
        'button/delete': 'Delete',
        'button/post': 'Post',
        'button/comments': 'Comments',
        'textarea/placeholder': 'Join the discusstion...',
        'text/anonymousUser': 'Anoymous User',
        'text/add_wildfire_to_your_site': 'Add Wildfire to your site',
        'error/noSiteId': 'Please check your config: missing "siteId".',
        'error/notValidSiteId': 'Please set a valid "siteId".',
        'error/notValidServiceProvider': 'Please check your config: "sercive" should be "firebase" or "wilddo"g.',
        'error/noDatabaseConfig': 'Please check your config: missing "databaseConfig"'
      }
    },
    'zh': {
      translation: {
        'button/reply': '回复',
        'button/cancel': '取消',
        'button/delete': '删除',
        'button/post': '发送',
        'button/comments': '条评论',
        'textarea/placeholder': '一起来发言吧...',
        'text/anonymousUser': '匿名用户',
        'text/add_wildfire_to_your_site': '在你的网站使用 Wildfire',
        'error/noSiteId': '请检查你的配置：找不到 "siteId。"',
        'error/notValidSiteId': '请设置一个有效的 "siteId。"',
        'error/notValidServiceProvider': '请检查你的配置： "sercive" 应该为 "firebase" 或者 "wilddog"。',
        'error/noDatabaseConfig': '请检查你的配置： 找不到 "databaseConfig"'
      }
    }
  }
}, (err, t) => {
  if (err) {
    console.error(err)
  } else {
    console.log('i18next Initialized!')
  }
})

var firebaseApp = firebase.initializeApp(window._wildfire.config.databaseConfig)
var db = firebaseApp.database()
Vue.prototype.$db = db

/* eslint-disable no-new */
new Vue({
  el: '#wild-fire',
  template: '<App/>',
  components: { App }
})

