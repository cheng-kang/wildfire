<template>
  <div class="wildfire">
    <wf-header
      :user="user" 
      :comment-count="Object.keys(comments).length"
      :commentsLoadingState="commentsLoadingState"></wf-header>
    <wf-body 
      :user="user" 
      :comments="commentsWithDotKey" 
      :commentsLoadingState="commentsLoadingState"></wf-body>
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
      comments: []
    }
  },
  // firebase: function () {
  //   const { siteId, pageURL } = this.$config
  //   const _this = this
  //   return {
  //     comments: {
  //       source: this.$commentDB.ref(`sites/${siteId}/${btoa(pageURL)}/comments`).orderByChild('order'),
  //       cancelCallback: error => {
  //         console.log(error)
  //         _this.commentsLoadingState = 'failed'
  //       },
  //       readyCallback: () => {
  //         _this.commentsLoadingState = 'finished'
  //       }
  //     }
  //   }
  // },
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
  created () {
    this.listenToUserAuth()
    this.listenToCommentsFromFirebase()
    this.$userApp.auth().getRedirectResult().then(result => {
      if (result.credential) {
        console.log('result')
        console.log(result)
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        // var token = result.credential.accessToken;
        // ...
      }
      // The signed-in user info.
      // var user = result.user;
      console.log('result1')
      console.log(result)
    }).catch(error => {
      console.log('error')
      console.log(error)
      // Handle Errors here.
      // var errorCode = error.code;
      // var errorMessage = error.message;
      // // The email of the user's account used.
      // var email = error.email;
      // // The firebase.auth.AuthCredential type that was used.
      // var credential = error.credential;
      // ...
    })
  },
  mounted () {
    // hide lodaing modal
    this.isLoaded = true
    // document.getElementById('wf-loading-modal').style.display = 'none'
  },
  methods: {
    listenToUserAuth () {
      const _this = this
      this.$userApp.auth().onAuthStateChanged((user) => {
        _this.user = user || null
      })
    },
    listenToCommentsFromFirebase () {
      this.commentsLoadingState = 'loading'
      const _this = this
      const { siteId, pageURL } = this.$config

      this.$bindAsArray('comments',
        this.$commentDB.ref(
          `sites/${siteId}/${btoa(pageURL)}/comments`).orderByChild('order'),
          () => {
            _this.commentsLoadingState = 'failed'
          },
          () => {
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
