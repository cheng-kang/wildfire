<template>
  <div :class="classes">
    <component v-for="(cpntName, idx) in pluginComponents['header.before']"
      :is="cpntName"
      :key="idx"
      :bus="bus"/>
    <wf-header :comments-loading-state="commentsLoadingState"/>
    <component v-for="(cpntName, idx) in pluginComponents['header.after']"
      :is="cpntName"
      :key="idx"
      :bus="bus"/>
    <wf-body
      :page-comments-count="pageCommentsCount"
      :comments="commentsWithId"
      :comments-loading-state="commentsLoadingState"/>
    <component v-for="(cpntName, idx) in pluginComponents['footer.before']"
      :is="cpntName"
      :key="idx"
      :bus="bus"/>
    <wf-footer/>
  </div>
</template>

<script>
import Vue from 'vue'
import elementResizeDetectorMaker from 'element-resize-detector'
import Bus from './common/bus'
import WfHeader from './layout/WfHeader'
import WfBody from './layout/WfBody'
import WfFooter from './layout/WfFooter'
export default {
  name: 'wildfire',
  components: {
    WfHeader,
    WfBody,
    WfFooter
  },
  data () {
    return {
      commentsLoadingState: 'prepare',
      pageCommentsCount: 0,
      pageComments: [],
      comments: [],
      banData: [],
      banList: []
    }
  },
  computed: {
    bus: () => Bus,
    pluginComponents: () => Bus.pluginComponents,
    auth: () => Bus.auth,
    config: () => Bus.config,
    db: () => Bus.db,
    user: () => Bus.user,
    i18next: () => Bus.i18next,
    classes () {
      return [
        'wf',
        `wf-theme-${this.config.theme}`
      ]
    },
    commentsWithId () {
      return this.comments.map((comment) => {
        return Object.assign({replies: {}},
          comment,
          { 'commentId': comment['.key'] }
        )
      }).reverse() // reverse the list to get descending comments
    }
  },
  created () {
    this.listenToAuthStateChange()
    this.listenToCommentsFromDatabase()

    /*
      `CurrentUserInfoUpdated` event observer
      Note: this observer watches user profile updates
            and change accordingly. The change here will
            affect all child components.
     */
    Bus.$on('CurrentUserInfoUpdated', updates => {
      Bus.user = Object.assign({}, Bus.user, {
        displayName: updates['/displayName'],
        photoURL: updates['/photoURL']
      })
    })

    this.$bindAsArray('banData', this.db.ref('ban'))

    Vue.http.get('https://api.userinfo.io/userinfos')
    .then(response => {
      Bus.$data.info = Object.assign({}, Bus.$data.info, {ip: response.data.ip_address})
      this.checkBanState()
      return response.data
    })
    .catch(error => {
      console.error(error)
      Bus.$data.info = Object.assign({}, Bus.$data.info, {ip: 'unknown'})
    })
    .then(data => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') { return }
      const { pageURL, pageTitle, databaseProvider } = this.config
      const wfAnalyticsURL = (databaseProvider === 'firebase' ? 'https://wildfire-bada3.firebaseio.com/' : 'https://autolayout.wilddogio.com/') + `sites/${pageURL}.json`
      Vue.http.post(wfAnalyticsURL, Object.assign({}, data, {pageTitle}))
    })
  },
  mounted () {
    // hide lodaing modal
    const wfLoadingModalEle = document.getElementById('wf-loading-modal')
    if (wfLoadingModalEle) {
      wfLoadingModalEle.style.display = 'none'
    }
    Bus.$data.windowWidth = this.$el.offsetWidth
    this.observer = elementResizeDetectorMaker()
    this.observer.listenTo(this.$el, () => {
      Bus.$data.windowWidth = this.$el.offsetWidth
    })
  },
  watch: {
    banData (newVal, oldVal) {
      this.banList = newVal.map((item) => {
        return item['.key'].replace(/-/g, '.')
      })
      this.checkBanState()
    }
  },
  methods: {
    /*
      Auth state observer
      Note: when auth state is changed, `this.user` is updated
            accordingly. If a user signs in, it retrieves user
            data from db (different from the auth `user`
            object).
     */
    listenToAuthStateChange () {
      this.auth.onAuthStateChanged((user) => {
        if (!user) {
          Bus.user = null
          return
        }
        this.db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
          const userData = snapshot.val()
          Bus.user = Object.assign({}, userData, {uid: user.uid, isAdmin: userData.isAdmin || false})
          this.checkBanState()
        })
      })
    },
    /*
      Comments observer
      Note: this keeps the comments up-to-realtime. It also
            watches `commentsCount` node in order to get the
            correct discussion count.
     */
    listenToCommentsFromDatabase () {
      this.commentsLoadingState = 'loading'
      const { pageURL } = this.config

      this.db.ref(`pages/${pageURL}/comments`).on('value', snapshot => {
        this.pageComments = snapshot.val() || {}
        this.pageCommentsCount = Object.keys(this.pageComments).length
        Promise.all(Object.keys(this.pageComments).map(commentId => {
          return this.db.ref(`commentReplies/${commentId}`).once('value')
        })).then(snaps => {
          Bus.$data.discussionCount = this.pageCommentsCount + snaps.reduce((repliesCount, snap) => {
            return repliesCount + Object.keys(snap.val() || {}).length
          }, 0)
        })
      }, err => {
        // Handle Wilddog `too many connections` error
        if (err.code === 26107 && this.config.standbyDatabaseConfigs.length !== 0) {
          this.$Message.warning({
            content: this.i18next.t('common.reset_when_wilddog_too_many_connections'),
            duration: 5
          })
          window.$_wildfire_reset({err})
        } else {
          this.$Message.error({
            content: this.i18next.t('common.wilddog_too_many_connections'),
            duration: 3
          })
        }
      })

      this.$bindAsArray('comments', this.db
      .ref(`comments`).orderByChild('pageURL').equalTo(pageURL), () => {
        this.commentsLoadingState = 'failed'
        this.pageCommentsCount = 0
        Bus.$data.discussionCount = 0
      }, () => {
        this.commentsLoadingState = 'finished'
      })
    },
    checkBanState () {
      const isBanned = (Bus.user && this.banList.indexOf(Bus.user.uid) > -1) || this.banList.indexOf(Bus.$data.info.ip) > -1
      Bus.$data.info = Object.assign({}, Bus.$data.info, {isBanned})
    }
  }
}
</script>
