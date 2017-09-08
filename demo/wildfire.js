(() => {
  function presentErrorMsg(errorCode) {
    const msg = i18next === undefined ? errorCode : i18next.t(errorCode)
    let wfLoadingModal = document.getElementById('wf-loading-modal')
    wfLoadingModal.className = 'wf wf-loading-modal' // cancel flicker animation

    let msgSpan = wfLoadingModal.children[1]
    msgSpan.innerHTML = msg
    msgSpan.style.color = 'red'
  }

  function loadRemoteCSS(item) {
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
    newCSS.rel  = 'stylesheet'
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

  function loadRemoteJS(item) {
    if (item === undefined || item === null) { return }

    let url = null
    let loaded = null
    if (typeof item === 'object') {
      url = item.url
      loaded = item.loaded
    } else if (typeof item === 'string') {
      url = item
    }
    let newScript = document.createElement('script')
    newScript.src = url
    newScript.onload = () => {
      console.log('Loaded:', url)
      if (loaded) {
        loaded()
      }
    }
    document.head.appendChild(newScript)
  }

  // A custom function to load remote JS file sequentially
  function loadRemoteJSSequentially(aList, finished) {
    if (aList.length === 0) { 
      if (finished !== undefined) {
        console.log('finished')
        finished()
      }
      return
    }
    let item = aList.pop()
    let url = null
    let loaded = null
    if (typeof item === 'object') {
      url = item.url
      loaded = item.loaded
    } else if (typeof item === 'string') {
      url = item
    }
    let newScript = document.createElement('script')
    newScript.src = url
    newScript.onload = () => {
      console.log('Loaded:', url)
      if (loaded) {
        loaded()
      }
      loadRemoteJSSequentially(aList, finished)
    }
    document.head.appendChild(newScript)
  }

  // load & init database for User service
  function loadUserDatabase() {
    if (database === 'firebase') {
      console.log('load firebase')
      // use firebase
      loadRemoteJS({
        url: './src/modules/firebase.js',
        loaded: () => {
          // Initialize Wildfire User Firebase
          var config = {
            apiKey: "AIzaSyB39UJBnIUYAQxu3zKkpyzjTZDDfHt7lzc",
            authDomain: "wild-fire-ee770.firebaseapp.com",
            databaseURL: "https://wild-fire-ee770.firebaseio.com",
            projectId: "wild-fire-ee770",
            storageBucket: "wild-fire-ee770.appspot.com",
            messagingSenderId: "655484997793"
          };
          window._wildfire.userApp = firebase.initializeApp(config, 'userApp');

          window._wildfire.userApp.database().ref('/sites/' + siteId).once('value').then((snapshot) => {
            const result = snapshot.val()
            if (!result) {
              presentErrorMsg('error/notValidSiteId')
              return
            }

            startWildfire()
            return
          })
        }
      })
    } else {
      // use wilddog
    }
  }

  // load JS
  function startWildfire() {
    console.log('start wild fire')
    loadRemoteJSSequentially([
        'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/js/temp/1/manifest.dc615b748ead8802ebe0.js',
        'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/js/temp/1/vendor.52336b1d8c4fad8d3275.js',
        'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/js/temp/1/app.980e10eb557eeb6e1610.js'
      ].reverse())
  }

  // 
  // Separator :)
  //

  // get global wildfire configuration
  const { 
    database = 'firebase',
    databaseConfig, // required
    siteId, // required
    pageTitle = document.title, 
    pageURL = window.location.href,
    locale = 'en'
  } = wildfireConfig

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


  if (siteId === undefined) {
    presentErrorMsg('error/noSiteId')
    return
  } else if (database !== 'firebase' && database !== 'wilddog') {
    presentErrorMsg('error/notValidServiceProvider')
    return
  } else if (!databaseConfig) {
    presentErrorMsg('error/noDatabaseConfig')
    return
  }

  loadRemoteCSS({
    url: './static/css/style.css',
    loaded: () => {
      // load & init i18next
      loadRemoteJS({
        url: './src/modules/i18next.min.js',
        loaded: () => {
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
                  'button/post':'Post',
                  'button/comments':'Comments',
                  'textarea/placeholder': 'Join the discusstion...',
                  'text/anonymousUser': 'Anoymous User',
                  'text/add_wildfire_to_your_site': 'Add Wildfire to your site',
                  'error/noSiteId': 'Please check your config: missing "siteId".',
                  'error/notValidSiteId': 'Please set a valid "siteId".',
                  'error/notValidServiceProvider': 'Please check your config: "sercive" should be "firebase" or "wilddog".',
                  'error/noDatabaseConfig': 'Please check your config: missing "databaseConfig"'
                }
              },
              'zh': {
                translation: {
                  'button/reply': '回复',
                  'button/cancel': '取消',
                  'button/delete': '删除',
                  'button/post':'发送',
                  'button/comments':'条评论',
                  'textarea/placeholder': '一起来发言吧...',
                  'text/anonymousUser': '匿名用户',
                  'text/add_wildfire_to_your_site': '在你的网站使用 Wildfire',
                  'error/noSiteId': '请检查你的配置：找不到 "siteId"。',
                  'error/notValidSiteId': '请设置一个有效的 "siteId"。',
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
            loadUserDatabase()
          })
        }
      })
    }
  })


})()