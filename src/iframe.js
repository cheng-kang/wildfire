(() => {
  const getTemplate = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Wildfire iframe</title>
        <style>
          .wildfire_thread{font-family:'Helvetica Neue',arial,sans-serif;width: 100%;margin:0 auto}[v-cloak]{display:none}#wf-loading-modal{font-size:12px;display:flex;flex-direction:column;height:300px;color:#656c7a;justify-content:center;align-items:center}#wf-loading-modal img{width:66px;height:66px}@keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-o-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-moz-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}@-webkit-keyframes flickerAnimation{0%{opacity:1}40%{opacity:0}100%{opacity:1}}.animate-flicker{-webkit-animation:flickerAnimation 1.5s infinite;-moz-animation:flickerAnimation 1.5s infinite;-o-animation:flickerAnimation 1.5s infinite;animation:flickerAnimation 1.5s infinite}
        </style>
      </head>
      <body>
        <div class="wildfire_thread"></div>
        <script src="https://unpkg.com/element-resize-detector@1.1.13/dist/element-resize-detector.min.js"></script>
        <script>
          const wfThread = document.getElementsByClassName("wildfire_thread")[0]
          const erd = elementResizeDetectorMaker()
          erd.listenTo(wfThread, (element) => {
            const newHeight = element.offsetHeight > 300 ? element.offsetHeight : 300
            console.log('new height', element.offsetHeight, newHeight)
            window.parent.document.getElementById('wildfire_iframe').style.height = newHeight + 'px'
          })
          var wildfireConfig = () => ({
            databaseProvider: '${databaseProvider}',
            databaseConfig: JSON.parse('${JSON.stringify(databaseConfig)}'),
            standbyDatabaseConfigs: '${standbyDatabaseConfigs.join(',')}'.split(','),
            pageTitle: '${pageTitle}',
            pageURL: '${pageURL}',
            pageURLMode: '${pageURLMode}',
            locale: '${locale}',
            theme: '${theme}',
            defaultAvatarURL: '${defaultAvatarURL}',
          })
        </script>
        <script src="https://unpkg.com/wildfire@${version}/dist/wildfire.auto.js"></script>
      </body>
    </html>
  `

  // Get configs from global configuration object
  const {
    version = 'latest',
    databaseProvider,
    databaseConfig,
    standbyDatabaseConfigs = [],
    pageTitle = document.title,
    pageURL,
    pageURLMode = 'normal',
    locale = 'en',
    theme = 'light',
    defaultAvatarURL = 'https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg',
    // plugins = []
  } = window.wildfireConfig()

  // Insert template
  let wildfireThreadDom = document.getElementsByClassName('wildfire_thread')[0]
  wildfireThreadDom.innerHTML = `
    <iframe id="wildfire_iframe" srcdoc="${getTemplate().replace(/"/g, '&quot;')}" width="100%" scrolling="no" frameBorder="0"></iframe>
  `
})()
