<template>
  <div :class="classes">
    <wf-header
      :user="user"
      :comments-loading-state="commentsLoadingState"></wf-header>
    <wf-body
      :user="user"
      :page-comments-count="pageCommentsCount"
      :comments="commentsWithId"
      :comments-loading-state="commentsLoadingState"></wf-body>
    <wf-footer :user="user"></wf-footer>
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
      user: null,
      pageCommentsCount: 0,
      pageComments: [],
      comments: [],
      banData: [],
      banList: []
    }
  },
  computed: {
    $auth () {
      return this.$_wf.auth
    },
    $config () {
      return this.$_wf.config
    },
    $db () {
      return this.$_wf.db
    },
    classes () {
      return [
        'wf',
        `wf-theme-${this.$config.theme}`
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
    this.listenToCommentsFromFirebase()

    /*
      `CurrentUserInfoUpdated` event observer
      Note: this observer watches user profile updates
            and change accordingly. The change here will
            affect all child components.
     */
    Bus.$on('CurrentUserInfoUpdated', updates => {
      this.user.displayName = updates['/displayName']
      this.user.photoURL = updates['/photoURL']
    })

    this.$bindAsArray('banData', this.$db.ref('ban'))

    Vue.http.get('https://api.ipify.org?format=json').then(response => {
      this.$set(this.$_wf.info, 'ip', response.body.ip)
      this.$set(this.$_wf.info, 'isBanned', this.banList.indexOf(this.$_wf.info.ip) > -1)
    }, response => {
      // error callback
      this.$set(this.$_wf.info, 'ip', 'unknown')
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
  beforeDestroy () {
    this.observer.removeListener(this.$refs.navWrap, this.handleResize)
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
      this.$auth.onAuthStateChanged((user) => {
        if (!user) {
          this.user = null
          return
        }
        this.$db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
          this.user = snapshot.val()
          this.$set(this.user, 'uid', user.uid)
          this.$set(this.user, 'isAdmin', snapshot.val().isAdmin || false)
          this.$set(this.user, 'isBanned', this.banList.indexOf(this.user.uid) > -1)
        })
      })
    },
    /*
      Comments observer
      Note: this keeps the comments up-to-realtime. It also
            watches `commentsCount` node in order to get the
            correct discussion count.
     */
    listenToCommentsFromFirebase () {
      this.commentsLoadingState = 'loading'
      const { pageURL } = this.$config

      this.$db.ref(`pages/${pageURL}/comments`).on('value', snapshot => {
        this.pageComments = snapshot.val() || {}
        this.pageCommentsCount = Object.keys(this.pageComments).length
        Promise.all(Object.keys(this.pageComments).map(commentId => {
          return this.$db.ref(`commentReplies/${commentId}`).once('value')
        })).then(snaps => {
          Bus.$data.discussionCount = this.pageCommentsCount + snaps.reduce((repliesCount, snap) => {
            return repliesCount + Object.keys(snap.val() || {}).length
          }, 0)
        })
      })

      this.$bindAsArray('comments', this.$db
      .ref(`comments`).orderByChild('pageURL').equalTo(pageURL), () => {
        this.commentsLoadingState = 'failed'
        this.pageCommentsCount = 0
        Bus.$data.discussionCount = 0
      }, () => {
        this.commentsLoadingState = 'finished'
      })
    },
    checkBanState () {
      if (this.user) {
        this.$set(this.user, 'isBanned', this.banList.indexOf(this.user.uid) > -1)
      }
      this.$set(this.$_wf.info, 'isBanned', this.banList.indexOf(this.$_wf.info.ip) > -1)
    }
  }
}
</script>
