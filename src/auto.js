(() => {
  function loadCSS (item) {
    if (item === undefined || item === null) { return }

    let url = null
    let loaded = null
    if (typeof item === 'object') {
      url = item.url
      loaded = item.loaded
    } else if (typeof item === 'string') {
      url = item
    }
    let newCSS = document.createElement('link')
    newCSS.rel = 'stylesheet'
    newCSS.type = 'text/css'
    newCSS.href = url
    newCSS.media = 'all'
    newCSS.onload = () => {
      console.log('Loaded:', url)
      if (loaded) {
        loaded()
      }
    }
    document.head.appendChild(newCSS)
  }

  /**
   * Dynamically load a list JS files sequentially.
   *
   * @param {(string|Object)[]} aList The list of JS files to load
   * @param {string} aList[].url The url of the JS file to load
   * @param {function} aList[].loaded Callback when the file is loaded
   * @param {function} aList[].shouldSkip Check before loading the file.
   *  Note: if `loaded` is set, it will be called no matter this loading is skiped or not.
   *        Skipping loading means only to skip the loading part.
   *
   * @param {function} finished Callback when all files loaded
   *
   * Example:
   *  1. `loadJSSequentially([
   *        'https://unpkg.com/vue',
   *        'https://unpkg.com/vuefire'
   *      ], () => {
   *        console.log('Finished loading!')
   *      })`
   *  2. `loadJSSequentially([
   *        {
   *          url: 'https://unpkg.com/vue',
   *          shouldSkip: () => window.Vue !== undefined,
   *          loaded: () => { console.log('Loaded Vue!') }
   *        },
   *        'https://unpkg.com/vuefire'
   *      ], () => {
   *        console.log('Finished loading!')
   *      })`
   */
  function loadJSSequentially (aList, finished) {
    if (aList.length === 0) {
      console.log('Finished loadJSSequentially.')
      if (finished) {
        finished()
      }
      return
    }
    let item = aList.shift()

    let newScript = document.createElement('script')

    let url = null
    let shouldSkip = null
    let loaded = null

    if (typeof item === 'object') {
      ({ url, shouldSkip, loaded } = item)
      if (shouldSkip()) {
        console.log('Skipped loading', url)
        console.timeEnd(`\tLoading time of "${url}"\n\t`)
        if (loaded) {
          loaded()
        }
        loadJSSequentially(aList, finished)
      } else {
        newScript.onload = () => {
          console.log('Loaded:', url)
          console.timeEnd(`\tLoading time of "${url}"\n\t`)
          if (loaded) {
            loaded()
          }
          loadJSSequentially(aList, finished)
        }
      }
    } else if (typeof item === 'string') {
      url = item
      newScript.onload = () => {
        console.log('Loaded:', url)
        console.timeEnd(`\tLoading time of "${url}"\n\t`)
        loadJSSequentially(aList, finished)
      }
    }
    newScript.src = url
    document.head.appendChild(newScript)
    console.time(`\tLoading time of "${url}"\n\t`)
  }

  // Custom `Exception`
  function WfException (message) {
    this.message = message
    this.toString = () => {
      return this.message
    }
  }

  // Custom translator to replace `i18next`
  function WfI18n (translation = {}, fallback = null, locale = 'en') {
    this.translation = translation
    this.locale = locale
    this.fallback = fallback

    this.t = (key) => {
      let result = this.translation[this.locale]
      if (!result) { result = this.translation[this.fallback] }
      if (!result) { throw new WfException(`Translation for locale "${this.locale}" not found.`) }
      const keys = key.split('.')
      if (keys.length === 0) { throw new WfException('Empty translation key.') }
      for (let i = 0; i < keys.length; i++) {
        result = result[keys[i]]
        if (!result) {
          setTimeout(() => {
            throw new WfException(`Translation for key "${key}" not found.`)
          })
          return key
        }
      }
      return result
    }
    return {
      t: this.t
    }
  }

  function startWildfire () {
    console.log('Starting Wildfire...')
    loadCSS(`https://unpkg.com/wildfire-dev/dist/${databaseProvider}/static/wildfire.css`)

    let jsList = []
    if (!window.Vue) { jsList.push('https://cdn.jsdelivr.net/npm/vue') }
    jsList.push(databaseProvider === 'firebase' ? 'https://www.gstatic.com/firebasejs/4.6.2/firebase.js' : 'https://cdn.wilddog.com/sdk/js/2.5.17/wilddog.js')
    jsList.push(`https://unpkg.com/wildfire-dev/dist/${databaseProvider}/wildfire.min.js`)

    loadJSSequentially(jsList, () => {
      window.Vue.use(window.wildfire, {
        databaseProvider,
        databaseConfig,
        standbyDatabaseConfigs,
        pageURL,
        pageURLMode,
        pageTitle,
        theme,
        locale,
        defaultAvatarURL,
        plugins
      })

      /* eslint-disable no-new */
      new window.Vue({
        el: '#wildfire',
        data () {
          return {
            resetKey: 0
          }
        },
        mounted () {
          window.$_wildfire_reset = (config, err) => {
            const wfLoadingModalEle = document.getElementById('wf-loading-modal')
            wfLoadingModalEle && (wfLoadingModalEle.style.display = 'block')
            window.wildfire.reset(window.Vue, config, err)
            this.resetKey += 1
          }
        }
      })
    })
  }

  function initDom () {
    const initialCSS = `.wildfire_thread{font-family:'Helvetica Neue',arial,sans-serif;width: 100%;margin:0 auto}[v-cloak]{display:none}#wf-loading-modal{font-size:12px;display:flex;flex-direction:column;height:300px;color:#656c7a;justify-content:center;align-items:center}#wf-loading-modal img{width:66px;height:66px}@keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-o-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-moz-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-webkit-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}.animate-flicker{-webkit-animation:flickerAnimation 1.5s infinite;-moz-animation:flickerAnimation 1.5s infinite;-o-animation:flickerAnimation 1.5s infinite;animation:flickerAnimation 1.5s infinite}`
    let initialStyle = document.createElement('style')
    initialStyle.type = 'text/css'
    if (initialStyle.styleSheet) {
      initialStyle.styleSheet.cssText = initialCSS
    } else {
      initialStyle.appendChild(document.createTextNode(initialCSS))
    }
    document.head.appendChild(initialStyle)

    // Insert template
    let wildfireThreadDom = document.getElementsByClassName('wildfire_thread')[0]
    wildfireThreadDom.innerHTML = `
      <div id="wf-loading-modal" class="wf wf-theme-${theme} animate-flicker">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M389.699 251.826s-13.403 19.689-41.493 36.356c0 0 20.344-171.938-112.212-201.8 33.962 124.643-43.199 159.794-71.326 93.943-46.971 62.713-11.307 117.427-11.307 117.427-19.26 2.775-35.439-18.267-35.439-18.267-.145 2.592-.225 5.202-.225 7.83 0 76.383 61.921 138.303 138.303 138.303s138.303-61.921 138.303-138.303c0-12.27-1.605-24.163-4.604-35.489z' fill='%23f36b38'/%3E%3Cpath d='M389.699 251.826s-13.403 19.689-41.493 36.356c0 0 18.22-154.012-92.206-195.825v333.261c76.383 0 138.303-61.921 138.303-138.303 0-12.27-1.605-24.163-4.604-35.489z' fill='%23db450d'/%3E%3Cpath d='M316.654 364.964c0 33.498-27.156 60.654-60.654 60.654s-60.654-27.156-60.654-60.654c0-17.93 7.78-34.042 20.147-45.146 23.451 31.86 56.87-16.469 30.826-51.761 0-.001 70.335 8.813 70.335 96.907z' fill='%23fbda35'/%3E%3Cpath d='M256 270.385v155.232c33.498 0 60.654-27.156 60.654-60.654 0-67.563-41.371-88.492-60.654-94.578z' fill='%23f7ba35'/%3E%3C/svg%3E%0A" alt="Wildfire - Provided by Lahk">
        <span>${window._i18n.t('text.powering_wildfire')}</span>
      </div>
      <div id="wildfire" v-cloak><wildfire :key="resetKey"></wildfire></div>
      `
  }

  /*
    Configs Validation
   */
  function presentErrorMsg (errorCode) {
    const msg = window._i18n.t(errorCode)
    let wfLoadingModal = document.getElementById('wf-loading-modal')
    wfLoadingModal.className = `wf wf-theme-${theme}` // cancel flicker animation

    let msgSpan = wfLoadingModal.children[1]
    msgSpan.innerHTML = msg
    msgSpan.style.color = 'red'
  }

  function checkConfigs () {
    const wildfireThreadDom = document.getElementsByClassName('wildfire_thread')
    if (wildfireThreadDom.length === 0) {
      presentErrorMsg('error.wildfire_thread_not_found')
      return
    } else if (databaseProvider !== 'firebase' && databaseProvider !== 'wilddog') {
      presentErrorMsg('error.invalid_database_provider')
      return
    } else if (!databaseConfig) {
      presentErrorMsg('error.no_database_config')
      return
    }
    startWildfire()
  }
  /*
    End of: Configs Validation
   */

  // Get configs from global configuration object
  const {
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs = [],
    pageTitle = document.title,
    pageURL,
    pageURLMode = 'normal',
    locale = 'en',
    theme = 'light',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',
    plugins = []
  } = window.wildfireConfig()

  // Set up custom translator for loading text & error message
  window._i18n = new WfI18n({
    en: {
      error: {
        invalid_database_provider: 'Please check your config: "databaseProvider" should be "firebase" or "wilddog".',
        wildfire_thread_not_found: '"wildfire-thread" not found, please follow the steps in documentation.',
        no_database_config: 'Please check your config: missing "databaseConfig"'
      },
      text: {
        powering_wildfire: 'Powering Wildfire...'
      }
    },
    'zh-CN': {
      error: {
        invalid_database_provider: '请检查你的配置： "databaseProvider" 应该为 "firebase" 或者 "wilddog"。',
        wildfire_thread_not_found: '未检测到 “wildfire-thread”，请依照文档所示步骤添加。',
        no_database_config: '请检查你的配置： 找不到 "databaseConfig"'
      },
      text: {
        powering_wildfire: '正在启动野火……'
      }
    }
  }, 'en', locale)

  initDom()
  // Forcing a 1s loading animation
  setTimeout(checkConfigs, 1000)
})()
