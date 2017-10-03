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
import Bus from './bus'
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
      comments: [],
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
    pageCommentsCount (newValue, oldValue) {
      this.discussionCount = this.discussionCount - oldValue + newValue
    },
    comments (newValue) {
      this.discussionCount = this.pageCommentsCount + newValue.reduce((sum, { repliesCount }) => {
        sum += repliesCount || 0
        return sum
      }, 0)
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
  },
  mounted () {
    // hide lodaing modal
    document.getElementById('wf-loading-modal').style.display = 'none'
  },
  methods: {
    /*
      Auth state observer
      Note: when auth state is changed, `this.user` is updated
            accordingly. If a user signs in, it retrieves user
            data from database (different from the auth `user`
            object).
     */
    listenToAuthStateChange () {
      this.$auth.onAuthStateChanged((user) => {
        if (!user) {
          this.user = null
          return
        }
        this.$database.ref(`users/${user.uid}`).once('value').then((snapshot) => {
          this.user = snapshot.val()
          this.$set(this.user, 'uid', user.uid)

          // Check if the current user is admin
          this.$set(this.user, 'isAdmin', false)
          this.$database.ref('admin').once('value').then(snapshot => {
            this.$set(this.user, 'isAdmin', snapshot.val() === this.user.email)
          })
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

      this.$database.ref(`pages/${btoa(pageURL)}/commentsCount`).on('value', snapshot => {
        const count = parseInt(snapshot.val()) || 0
        this.pageCommentsCount = count
      })

      this.$bindAsArray('comments', this.$database
      .ref(`pages/${btoa(pageURL)}/comments`).orderByChild('order'), () => {
        this.commentsLoadingState = 'failed'
        this.pageCommentsCount = 0
      }, () => {
        this.commentsLoadingState = 'finished'
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
