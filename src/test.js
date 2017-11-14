
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
  // theme: 'light',
  theme: 'dark',
  // locale: 'en'
  locale: 'zh-CN'
}

const wildfireConfig = {
  databaseProvider: 'firebase',
  databaseConfig: {
    apiKey: 'AIzaSyB39UJBnIUYAQxu3zKkpyzjTZDDfHt7lzc',
    authDomain: 'wild-fire-ee770.firebaseapp.com',
    databaseURL: 'https://wild-fire-ee770.firebaseio.com',
    projectId: 'wild-fire-ee770',
    storageBucket: 'wild-fire-ee770.appspot.com',
    messagingSenderId: '655484997793'
  },
  pageURL: 'http://chengkang.me/wildfire',
  pageTitle: 'Wildfire Demo',
  theme: 'light',
  // theme: 'dark',
  locale: 'en'
  // locale: 'zh-CN'
}

const {
  databaseProvider,
  databaseConfig, // required
  pageTitle = document.title,
  pageURL = window.location.href,
  theme = 'light',
  locale = 'en'
} = wildfireConfig
/*
  End of: Testing configs
 */