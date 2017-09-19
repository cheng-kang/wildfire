<template>
  <div class="wildfire">
    <wf-header
      :user="user" 
      :discussion-count="discussionCount"
      :comments-loading-state="commentsLoadingState"></wf-header>
    <wf-body 
      :user="user" 
      :page-comments-count="pageCommentsCount"
      :comments="commentsWithDotKey" 
      :comments-loading-state="commentsLoadingState"></wf-body>
    <wf-footer :user="user"></wf-footer>
  </div>
</template>

<script>
import WfHeader from './layout/WfHeader'
import WfBody from './layout/WfBody'
import WfFooter from './layout/WfFooter'
export default {
  name: 'wildfire',
  components: {
    WfHeader, WfBody, WfFooter
  },
  data () {
    return {
      isLoaded: false,
      commentsLoadingState: 'prepare',
      user: null,
      pageCommentsCount: 0,
      comments: [],
      numberOfCommentsPerPage: 10,
      discussionCount: 0
    }
  },
  computed: {
    commentsWithDotKey () {
      // make sure each comment object has (1) '.key', and (2) 'replies'
      return this.comments.map((comment) => {
        return Object.assign({replies: {}},
          comment,
          {'.key': comment['.key']}
        )
      })
    }
  },
  watch: {
    pageCommentsCount (newValue) {
      this.discussionCount = newValue + this.comments.reduce((sum, { repliesCount }) => {
        sum += repliesCount || 0
        return sum
      }, 0)
    },
    comments (newValue) {
      this.discussionCount = this.pageCommentsCount + newValue.reduce((sum, { repliesCount }) => {
        sum += repliesCount || 0
        return sum
      }, 0)
    }
  },
  created () {
    this.listenToUserAuth()
    this.listenToCommentsFromFirebase()
  },
  mounted () {
    // hide lodaing modal
    this.isLoaded = true
    // document.getElementById('wf-loading-modal').style.display = 'none'
  },
  methods: {
    listenToUserAuth () {
      this.$userApp.auth().onAuthStateChanged((user) => {
        if (user === null) {
          this.user = null
          return
        }
        this.$userApp.database().ref(`users/${user.uid}`).once('value').then((snapshot) => {
          this.user = snapshot.val()
          this.user['uid'] = user.uid
        })
      })
    },
    listenToCommentsFromFirebase () {
      this.commentsLoadingState = 'loading'
      const _this = this
      const { siteId, pageURL } = this.$config

      this.$commentDB.ref(`sites/${siteId}/${btoa(pageURL)}/commentsCount`).on('value', snapshot => {
        const count = parseInt(snapshot.val()) || 0
        _this.pageCommentsCount = count
      })

      this.$bindAsArray('comments',
        this.$commentDB.ref(
          `sites/${siteId}/${btoa(pageURL)}/comments`).orderByChild('order')
          // .limitToFirst(this.numberOfCommentsPerPage)
          , () => {
            _this.commentsLoadingState = 'failed'
            window._wildfire.pageCommentsCount = 0
          }, () => {
            _this.commentsLoadingState = 'finished'
          })
    }
  }
}
</script>

<style>
.wildfire {
  margin: 0 auto;
  padding: 10px;

  max-width: 39rem;

  font-family: "Helvetica Neue",arial,sans-serif;
  font-size: 15px;
}
</style>
