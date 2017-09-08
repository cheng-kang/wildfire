(() => {
  // load CSS
  const vCloakCSS = `
    [v-cloak] { display: none; }
    .wf {
      margin: 0 auto;

      max-width: 39rem;

      font-family: "Helvetica Neue",arial,sans-serif;
      font-size: 15px;
    }
    .wf-loading-modal {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 300px;
      color: #656c7a;
      font-size: 12px;
    }

    .wf-loading-modal img {
      width: 66px;
      height: 66px;
    }

    @keyframes flickerAnimation {
      0%   { opacity:1; }
      40%  { opacity:0; }
      100% { opacity:1; }
    }
    @-o-keyframes flickerAnimation{
      0%   { opacity:1; }
      40%  { opacity:0; }
      100% { opacity:1; }
    }
    @-moz-keyframes flickerAnimation{
      0%   { opacity:1; }
      40%  { opacity:0; }
      100% { opacity:1; }
    }
    @-webkit-keyframes flickerAnimation{
      0%   { opacity:1; }
      40%  { opacity:0; }
      100% { opacity:1; }
    }
    .animate-flicker {
       -webkit-animation: flickerAnimation 1.5s infinite;
       -moz-animation: flickerAnimation 1.5s infinite;
       -o-animation: flickerAnimation 1.5s infinite;
        animation: flickerAnimation 1.5s infinite;
    }
  `
  let vCloakStyle = document.createElement('style')
  vCloakStyle.type = 'text/css'
  if (vCloakStyle.styleSheet){
    vCloakStyle.styleSheet.cssText = vCloakCSS;
  } else {
    vCloakStyle.appendChild(document.createTextNode(vCloakCSS));
  }
  document.head.appendChild(vCloakStyle)

  document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="./src/wf-main.css">'
  // document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="http://127.0.0.1:8080/src/modules/tribute.css">'

  // insert basic template
  let wildfire_thread = document.getElementsByClassName('wildfire_thread')[0]
  wildfire_thread.innerHTML = `
    <div id="wf-loading-modal" class="wf wf-loading-modal animate-flicker">
        <img src="./static/wildfire-logo.svg" title="Wildfire - Provided by Lahk">
        <span>Powering Wildfire...</span>
    </div>
    <div id="wild-fire" class="wf wf-main" :class="{ active: isLoaded }" v-cloak>
      <header class="wf-header">
        <nav class="wf-nav">
          <div class="wf-nav-left">
            <a class="active" id="wf-comment-count">{{comments.length}} {{$i18next.t('button/comments')}}</a>
            <a>{{user === null ? $i18next.t('text/anonymousUser') : user.displayName}}</a>
          </div>
          <div class="wf-nav-right">
            <a @click="signInWithGitHub" v-show="!user">Sign in</a>
            <a @click="signOut" v-show="user">Sign out</a>
          </div>
        </nav>
      </header>
      <section>
        <wf-reply-area :user="user"></wf-reply-area>
        <ul class="wf-comment-group">
          <template v-for="comment in comments">
            <wf-comment-card 
              :key="comment['.key']" 
              :comment="comment"></wf-comment-card>
            <ul v-if="comment.replies && comment.replies.length !== 0" class="wf-reply-group">
              <wf-comment-card 
                v-for="(reply, key) in comment.replies" 
                :key="key" 
                :comment="{ ...reply, '.key': key}"
                :parent-comment="comment"></wf-comment-card>
            </ul>
          </template>
        </ul>
      </section>
      <footer class="wf-footer">
        <a id="add-to-your-site" href="https://github.com/cheng-kang/Wild-Fire" target="blank"><img src="./static/add-button.svg">{{$i18next.t('text/add_wildfire_to_your_site')}}</a>
        <img class="wf-logo" src="./static/wildfire-logo.svg" title="Wildfire - Provided by Lahk">
      </footer>
    </div>
  `

  function presentErrorMsg(errorCode) {
    const msg = i18next === undefined ? errorCode : i18next.t(errorCode)
    let wfLoadingModal = document.getElementById('wf-loading-modal')
    wfLoadingModal.className = 'wf wf-loading-modal' // cancel flicker animation

    let msgSpan = wfLoadingModal.children[1]
    msgSpan.innerHTML = msg
    msgSpan.style.color = 'red'
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
        url: 'https://www.gstatic.com/firebasejs/4.3.0/firebase.js',
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
        {
          url: 'https://momentjs.com/downloads/moment.min.js',
          loaded: () => {
            moment.locale(locale, {
              relativeTime : {
                  future: "%s后",
                  past:   "%s前",
                  s  : '几秒',
                  ss : '%d 秒',
                  m:  "1 分钟",
                  mm: "%d 分钟",
                  h:  "1 小时",
                  hh: "%d 小时",
                  d:  "1 天",
                  dd: "%d 天",
                  M:  "1 个月",
                  MM: "%d 个月",
                  y:  "1 年",
                  yy: "%d 年"
              }
            })
          }
        },
        'https://unpkg.com/vuefire/dist/vuefire.js',
        // 'https://unpkg.com/vue@2.4.2/dist/vue.min.js',
        'https://unpkg.com/vue@2.4.2/dist/vue.js',
        // 'http://127.0.0.1:8080/src/modules/tribute.min.js',
        // 'http://127.0.0.1:8080/dist/wf-firebase.js'
        './src/wf-firebase.js'
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
      defaultAvatar: './static/firefighter-avatar.png',
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
})()