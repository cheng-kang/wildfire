import VueResource from 'vue-resource'
import wilddog from 'wilddog'
import VueWild from 'vuewild'
import Bus from './common/bus'
import { initLocalComponents } from './common/loadLocalComponents'
import iView from './common/loadiView'
import dateFns from './common/loadDateFns'
import i18next, { initI18next, resetI18next, addTranslation } from './common/loadI18next'
import { b64EncodeUnicode, b64DecodeUnicode } from './common/utils'
import Wildfire from './Wildfire'
import './assets/style.css'
import './assets/style.dark.css'
import './assets/animation.css'

const install = (_Vue, config) => {
  // Init wildfire components
  initLocalComponents(_Vue)

  if (!_Vue.http) { _Vue.use(VueResource) }

  _Vue.use(iView)

  const {
    // databaseProvider = 'wilddog',
    databaseConfig, // required
    pageTitle = document.title,
    pageURL = window.location.href,
    theme = 'light',
    locale = 'en',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',
    plugins = []
  } = config

  initI18next(locale)

  const { formatDate, distanceInWordsToNow } = dateFns(locale)

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
    i18next,
    formatDate,
    distanceInWordsToNow,
    plugins,
    pluginComponents: {},
    pluginOptions: {}
  }

  if (!_Vue.$bindAsObject) { _Vue.use(VueWild) }
  wf.dbApp = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`
  }, 'wildfire')
  wf.db = wf.dbApp.sync()
  wf.auth = wf.dbApp.auth()
  wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential

  wf.b64EncodeUnicode = b64EncodeUnicode
  wf.b64DecodeUnicode = b64DecodeUnicode

  Object.assign(Bus, wf)

  // Install plugins
  plugins.forEach(plugin => {
    plugin.install({
      registerComponent: (name, component) => {
        _Vue.component(name, component)
      },
      i18n: (lang, translation) => {
        addTranslation(lang, translation)
      },
      renderAt: (place, componentName) => {
        (Bus.pluginComponents[place] ? Bus.pluginComponents[place].push(componentName) : Object.assign(Bus.pluginComponents, {[place]: [componentName]}))
      }
    })
    Object.assign(Bus.pluginOptions, {[plugin.name]: plugin.options})
  })

  _Vue.component('wildfire', Wildfire)
}

const reset = (_Vue, { config = {}, err }) => {
  const getDatabaseConfig = () => {
    const { standbyDatabaseConfigs, databaseConfig, databaseProvider } = Bus.config
    if (standbyDatabaseConfigs.length === 0 || !err || err.code !== 26107) return databaseConfig
    const currentConfigIdx = standbyDatabaseConfigs.findIndex(config => databaseProvider === 'firebase' ? config.projectId === databaseConfig.projectId : config.siteId === databaseConfig.siteId)
    if (currentConfigIdx === -1 || currentConfigIdx === standbyDatabaseConfigs.length - 1) return standbyDatabaseConfigs[0]
    return standbyDatabaseConfigs[currentConfigIdx + 1]
  }
  let {
    databaseProvider = Bus.config.databaseProvider,
    databaseConfig = Bus.config.databaseConfig, // required
    pageTitle = document.title,
    pageURL = window.location.href,
    theme = Bus.config.theme,
    locale = Bus.config.locale,
    defaultAvatarURL = Bus.config.defaultAvatarURL,
    plugins = Bus.plugins
  } = config

  if (!databaseConfig) databaseConfig = getDatabaseConfig()

  resetI18next(locale)

  const { formatDate, distanceInWordsToNow } = dateFns(locale)

  const wf = {
    config: {
      databaseProvider,
      databaseConfig,
      pageTitle,
      pageURL: b64EncodeUnicode(pageURL), // encode pageURL with base64
      locale,
      theme,
      defaultAvatarURL,
      anonymousUserId: 'Anonymous'
    },
    formatDate,
    distanceInWordsToNow,
    plugins,
    pluginComponents: {},
    pluginOptions: {}
  }

  wf.dbApp = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`
  }, `wildfire-${databaseConfig.siteId}`)
  wf.db = wf.dbApp.sync()
  wf.auth = wf.dbApp.auth()
  wf.authService = wilddog.auth.WilddogAuthProvider.emailCredential

  Object.assign(Bus, wf)

  // Install plugins
  plugins.forEach(plugin => {
    plugin.install({
      registerComponent: (name, component) => {
        !_Vue.options.components[name] && _Vue.component(name, component)
      },
      i18n: (lang, translation) => {
        addTranslation(lang, translation)
      },
      renderAt: (place, componentName) => {
        (Bus.pluginComponents[place] ? Bus.pluginComponents[place].push(componentName) : Object.assign(Bus.pluginComponents, {[place]: [componentName]}))
      }
    })
    Object.assign(Bus.pluginOptions, {[plugin.name]: plugin.options})
  })
}

export default {install, reset}
