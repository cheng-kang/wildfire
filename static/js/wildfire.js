(() => {

  function loadCSS(item) {
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

  /**
   * Dynamically load a JS file.
   * 
   * @param {string|Object} item
   * @param {string} item.url The url of the JS file to load
   * @param {function} item.loaded Callback function when the file is loaded
   * @param {function} item.shouldLoad Checking function before loading the file. 
   */
  function loadJS(item) {
    if (item === undefined || item === null) { return }

    let newScript = document.createElement('script')

    let url = null, shouldLoad = null, loaded = null

    if (typeof item === 'object') {
      ({ url, shouldLoad, loaded } = item)
      if (!shouldLoad || shouldLoad()) {
        newScript.onload = () => {
          console.log('Loaded:', url)
          console.timeEnd(`\tLoading time of "${url}"\n\t`)
          if (loaded) {
            loaded()
          }
        }
      }
    } else if (typeof item === 'string') {
      url = item
    }
    newScript.src = url
    document.head.appendChild(newScript)
    console.time(`\tLoading time of "${url}"\n\t`)
  }

  /**
   * Dynamically load a list JS files sequentially.
   * 
   * @param {(string|Object)[]} aList The list of JS files to load
   * @param {string} aList[].url The url of the JS file to load
   * @param {function} aList[].loaded Callback function when the file is loaded
   * @param {function} aList[].shouldLoad Checking function before loading the file. 
   * 
   * @param {function} finished Callback when all files loaded
   */
  function loadJSSequentially(aList, finished) {
    if (aList.length === 0) { 
      console.log('Finished loadJSSequentially.')
      if (finished) {
        finished()
      }
      return
    }
    let item = aList.shift()

    let newScript = document.createElement('script')

    let url = null, shouldLoad = null, loaded = null

    if (typeof item === 'object') {
      ({ url, shouldLoad, loaded } = item)
      console.log(url, shouldLoad, loaded )
      console.log(!shouldLoad || (shouldLoad && shouldLoad()))
      if (!shouldLoad || (shouldLoad && shouldLoad())) {
        newScript.onload = () => {
          console.log('Loaded:', url)
          if (loaded) {
            loaded()
          }
          loadJSSequentially(aList, finished)
        }
      } else {
        loadJSSequentially(aList, finished)
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

  function startWildfire() {
    console.log('Starting Wildfire...')
    loadCSS('./static/css/app.css')
    loadJSSequentially([
        './static/js/manifest.js',
        './static/js/vendor.js',
        './static/js/app.js'
      ])
  }

  function initDom() {
    const initialCSS = `.wildfire_thread{font-family:'Helvetica Neue',arial,sans-serif;font-size:15px;max-width:39rem;margin:0 auto}[v-cloak]{display:none}.wf-loading-modal{font-size:12px;display:flex;flex-direction:column;height:300px;color:#656c7a;justify-content:center;align-items:center}.wf-loading-modal img{width:66px;height:66px}@keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-o-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-moz-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-webkit-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}.animate-flicker{-webkit-animation:flickerAnimation 1.5s infinite;-moz-animation:flickerAnimation 1.5s infinite;-o-animation:flickerAnimation 1.5s infinite;animation:flickerAnimation 1.5s infinite}`
    let initialStyle = document.createElement('style')
    initialStyle.type = 'text/css'
    if (initialStyle.styleSheet){
      initialStyle.styleSheet.cssText = initialCSS;
    } else {
      initialStyle.appendChild(document.createTextNode(initialCSS));
    }
    document.head.appendChild(initialStyle)

    // Insert template
    let wildfireThreadDom = document.getElementsByClassName('wildfire_thread')[0]
    wildfireThreadDom.innerHTML = `
      <div id="wf-loading-modal" class="wf-loading-modal animate-flicker">
        <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjI1NnB4IiBoZWlnaHQ9IjM1MXB4IiB2aWV3Qm94PSIwIDAgMjU2IDM1MSIgdmVyc2lvbj0iMS4xIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+DQogIDxkZWZzPg0KICAgIDxwYXRoIGQ9Ik0xLjI1MjczNDM3IDI4MC43MzE2NDFMMi44NTgzNDUzMyAyNzcuNjAwODU4IDEwMi4yMTExNzcgODkuMDgzMzU0NiA1OC4wNjEzMjY2IDUuNjA4MjAzM0M1NC4zOTIwMDExLTEuMjgzMDQ1NzggNDUuMDc0MTI0NSAwLjQ3MzY3NDM5OCA0My44Njk5MjAzIDguMTg3ODkwODZMMS4yNTI3MzQzNyAyODAuNzMxNjQxWiIgaWQ9InBhdGgtMSIgLz4NCiAgICA8ZmlsdGVyIHg9Ii01MCUiIHk9Ii01MCUiIHdpZHRoPSIyMDAlIiBoZWlnaHQ9IjIwMCUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgaWQ9ImZpbHRlci0yIj4NCiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjE3LjUiIGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dCbHVySW5uZXIxIiAvPg0KICAgICAgPGZlT2Zmc2V0IGR4PSIwIiBkeT0iMCIgaW49InNoYWRvd0JsdXJJbm5lcjEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0SW5uZXIxIiAvPg0KICAgICAgPGZlQ29tcG9zaXRlIGluPSJzaGFkb3dPZmZzZXRJbm5lcjEiIGluMj0iU291cmNlQWxwaGEiIG9wZXJhdG9yPSJhcml0aG1ldGljIiBrMj0iLTEiIGszPSIxIiByZXN1bHQ9InNoYWRvd0lubmVySW5uZXIxIiAvPg0KICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMDYgMCIgdHlwZT0ibWF0cml4IiBpbj0ic2hhZG93SW5uZXJJbm5lcjEiIC8+DQogICAgPC9maWx0ZXI+DQogICAgPHBhdGggZD0iTTEzNC40MTcxMDMgMTQ4Ljk3NDIzNUwxNjYuNDU1NzIyIDExNi4xNjE3MzggMTM0LjQxNzEwNCA1NS4xNTQ2ODc0QzEzMS4zNzQ4MjggNDkuMzYzNTkxMSAxMjMuOTgzOTExIDQ4Ljc1NjgzNjIgMTIwLjk3MzgyOCA1NC41NjQ2NDgzTDEwMy4yNjg3NSA4OC42NzM4Mjk2IDEwMi43Mzk0MjMgOTAuNDE3NTQ3MyAxMzQuNDE3MTAzIDE0OC45NzQyMzVaIiBpZD0icGF0aC0zIiAvPg0KICAgIDxmaWx0ZXIgeD0iLTUwJSIgeT0iLTUwJSIgd2lkdGg9IjIwMCUiIGhlaWdodD0iMjAwJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iZmlsdGVyLTQiPg0KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMy41IiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93Qmx1cklubmVyMSIgLz4NCiAgICAgIDxmZU9mZnNldCBkeD0iMSIgZHk9Ii05IiBpbj0ic2hhZG93Qmx1cklubmVyMSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRJbm5lcjEiIC8+DQogICAgICA8ZmVDb21wb3NpdGUgaW49InNoYWRvd09mZnNldElubmVyMSIgaW4yPSJTb3VyY2VBbHBoYSIgb3BlcmF0b3I9ImFyaXRobWV0aWMiIGsyPSItMSIgazM9IjEiIHJlc3VsdD0ic2hhZG93SW5uZXJJbm5lcjEiIC8+DQogICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4wOSAwIiB0eXBlPSJtYXRyaXgiIGluPSJzaGFkb3dJbm5lcklubmVyMSIgLz4NCiAgICA8L2ZpbHRlcj4NCiAgPC9kZWZzPg0KICA8cGF0aCBkPSJNMCAyODIuOTk3NjJMMi4xMjI1MDc0NiAyODAuMDI1NiAxMDIuNTI3MzYzIDg5LjUxMTkyODQgMTAyLjczOTQyMyA4Ny40OTUxMzIzIDU4LjQ3ODgwNiA0LjM1ODE3NzExQzU0Ljc3MDYyNjktMi42MDYwNDE3OSA0NC4zMzEzMDM1LTAuODQ1MjQ1NzcxIDQzLjExNDM0ODMgNi45NTA2NTQ3M0wwIDI4Mi45OTc2MloiIGZpbGw9IiNEQjQ1MEQiIC8+DQogIDx1c2UgZmlsbD0iI0RCNDUwRCIgZmlsbC1ydWxlPSJldmVub2RkIiB4bGluazpocmVmPSIjcGF0aC0xIiAvPg0KICA8dXNlIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjEiIGZpbHRlcj0idXJsKCNmaWx0ZXItMikiIHhsaW5rOmhyZWY9IiNwYXRoLTEiIC8+DQogIDx1c2UgZmlsbD0iI0RCNDUwRCIgZmlsbC1ydWxlPSJldmVub2RkIiB4bGluazpocmVmPSIjcGF0aC0zIiAvPg0KICA8dXNlIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjEiIGZpbHRlcj0idXJsKCNmaWx0ZXItNCkiIHhsaW5rOmhyZWY9IiNwYXRoLTMiIC8+DQogIDxwb2x5Z29uIGZpbGw9IiNCMTMxMDEiIHBvaW50cz0iMCAyODIuOTk3NjIgMC45NjIwOTcxNjggMjgyLjAzMDM5NiA0LjQ1NzcxMTQ0IDI4MC42MDk1NiAxMzIuOTM1MzIzIDE1Mi42MDk1NiAxMzQuNTYzMDI1IDE0OC4xNzg1OTUgMTAyLjUxMzEyMyA4Ny4xMDQ4NTg0IiAvPg0KICA8cGF0aCBkPSJNMTM5LjEyMDk3MSAzNDcuNTUxMjY4TDI1NS4zOTU5MTYgMjgyLjcwMzY2NiAyMjIuMTkxNjk4IDc4LjIwOTMzNzNDMjIxLjE1MzA1MSA3MS44MTEyNDc4IDIxMy4zMDM2NTggNjkuMjgxODE0OSAyMDguNzI0MzE0IDczLjg2OTQzNjhMMC4wMDAyNTQ3MjYzNjggMjgyLjk5Nzg3NSAxMTUuNjA4NDU0IDM0Ny41NDU1MzZDMTIyLjkxNDY0MyAzNTEuNjI0OTc5IDEzMS44MTI4NzIgMzUxLjYyNjg5IDEzOS4xMjA5NzEgMzQ3LjU1MTI2OE0yNTQuMzU0MDg0IDI4Mi4xNTk4MzdMMjIxLjQwMTkzNyA3OS4yMTc5MzY5QzIyMC4zNzExNzUgNzIuODY4NDE4OCAyMTMuODQzNzkyIDcwLjI0MDk1NTMgMjA5LjI5OTIxMyA3NC43OTM3NUwxLjI4OTQ1MzEyIDI4Mi42MDA3ODUgMTE1LjYyNzgyNSAzNDYuNTA5NDU4QzEyMi44Nzg1NDggMzUwLjU1NzkzMSAxMzEuNzA5MjI2IDM1MC41NTk4MjcgMTM4Ljk2MTg0NiAzNDYuNTE1MTQ2TDI1NC4zNTQwODQgMjgyLjE1OTgzN1oiIGZpbGw9IiNGMzZBMzgiIC8+DQo8L3N2Zz4=" title="Wildfire - Provided by Lahk">
        <span>${i18next.t('text/poweringWildfire')}</span>
      </div>
      <div id="wildfire" v-cloak></div>
      `
  }

  /*
    Configs Validation
   */
  function presentErrorMsg (errorCode) {
    const msg = i18next === undefined ? errorCode : i18next.t(errorCode)
    let wfLoadingModal = document.getElementById('wf-loading-modal')
    wfLoadingModal.className = 'wf wf-loading-modal' // cancel flicker animation

    let msgSpan = wfLoadingModal.children[1]
    msgSpan.innerHTML = msg
    msgSpan.style.color = 'red'
  }

  function checkConfigs () {
    if (databaseProvider !== 'firebase' && databaseProvider !== 'wilddog') {
      presentErrorMsg('error/notValidDatabaseProvider')
      return
    } else if (!databaseConfig) {
      presentErrorMsg('error/noDatabaseConfig')
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
    databaseConfig, // required
    pageTitle = document.title,
    pageURL = window.location.href,
    locale = 'en'
  } = window.wildfireConfig()

  // load & init i18next
  loadJS({
    // url: 'https://unpkg.com/i18next/i18next.min.js',
    url: './static/js/i18next.min.js',
    shouldLoad: () => {
      return window.i18next === undefined
    },
    loaded: () => {
      i18next.init({
        lng: locale,
        debug: true,
        resources: {
          en: {
            translation: {
              'text/poweringWildfire': 'Powering Wildfire...',
              'error/notValidDatabaseProvider': 'Please check your config: "databaseProvider" should be "firebase" or "wilddog".',
              'error/noDatabaseConfig': 'Please check your config: missing "databaseConfig"'
            }
          },
          'zh': {
            translation: {
              'text/poweringWildfire': '正在启动 Wildfire……',
              'error/notValidDatabaseProvider': '请检查你的配置： "databaseProvider" 应该为 "firebase" 或者 "wilddog"。',
              'error/noDatabaseConfig': '请检查你的配置： 找不到 "databaseConfig"'
            }
          }
        }
      }, (err, t) => {
        if (err) { 
          console.error(err) 
        } else {
          console.log('i18next Initialized!')
          initDom()
          // Forcing a 1s loading animation
          setTimeout(checkConfigs, 1000)
        }
      })
    }
  })
})()