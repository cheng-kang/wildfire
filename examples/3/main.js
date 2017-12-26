// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import wildfire from '../../src/aio'

Vue.config.productionTip = true
Vue.use(wildfire, {
  // databaseProvider: 'firebase',
  // databaseConfig: {
  //   apiKey: 'AIzaSyB39UJBnIUYAQxu3zKkpyzjTZDDfHt7lzc',
  //   authDomain: 'wild-fire-ee770.firebaseapp.com',
  //   databaseURL: 'https://wild-fire-ee770.firebaseio.com',
  //   projectId: 'wild-fire-ee770',
  //   storageBucket: 'wild-fire-ee770.appspot.com',
  //   messagingSenderId: '655484997793'
  // },
  databaseProvider: 'wilddog',
  databaseConfig: {
    siteId: 'wd2168973289ifdmcg'
  },
  pageURL: 'http://chengkang.me/wildfire',
  pageTitle: 'Wildfire Demo',
  // defaultAvatarURL: 'https://image.flaticon.com/icons/svg/621/621863.svg',
  theme: 'light',
  // theme: 'dark',
  // locale: 'en'
  locale: 'zh-CN'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
