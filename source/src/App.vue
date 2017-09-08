<template>
  <div id="wild-fire">
    <div id="wf-loading-modal" class="wf wf-loading-modal animate-flicker">
        <img src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/wildfire-logo.svg" title="Wildfire - Provided by Lahk">
        <span>Powering Wildfire...</span>
    </div>
    <div id="wild-fire" class="wf wf-main" :class="{ active: isLoaded }">
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
              :user="userData"
              :comment="comment"></wf-comment-card>
            <ul v-if="comment.replies && comment.replies.length !== 0" class="wf-reply-group">
              <wf-comment-card 
                v-for="(reply, key) in comment.replies" 
                :key="key" 
                :user="userData"
                :comment="Object.assign({'.key': key}, reply)"
                :parent-comment="comment"></wf-comment-card>
            </ul>
          </template>
        </ul>
      </section>
      <footer class="wf-footer">
        <a id="add-to-your-site" href="https://github.com/cheng-kang/wildfire" target="blank"><img src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/add-button.svg">{{$i18next.t('text/add_wildfire_to_your_site')}}</a>
        <img class="wf-logo" src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/wildfire-logo.svg" title="Wildfire - Provided by Lahk">
      </footer>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import WfReplyArea from './components/WFReplyArea'
import WfCommentCard from './components/WFCommentCard'
export default {
  name: 'wild-fire',
  components: {
    WfReplyArea, WfCommentCard
  },
  data () {
    return {

      isLoaded: false,
      userApp: null,
      firebaseGitHubProvider: null,
      config: null,
      user: null
    }
  },
  computed: {
    userData () {
      if (!this.user) { return null }
      const { uid, photoURL, displayName } = this.user
      return { uid, photoURL, displayName }
    }
  },
  watch: {
    user (newValue) {
      window._wildfire.currentUser = newValue
    }
  },
  firebase () {
    return {
      comments: this.$db.ref(`sites/${window._wildfire.config.siteId}/${btoa(window._wildfire.config.pageURL)}/comments`).orderByChild('order')
    }
  },
  created () {
    const _this = this

    this.config = window._wildfire.config

    this.userApp = window._wildfire.userApp
    if (this.config.database === 'firebase') {
      // init Firebase Github Auth
      this.firebaseGitHubProvider = new firebase.auth.GithubAuthProvider()
      console.log('Firebase Github Provider Initialized.')
    }
    this.userApp.auth().onAuthStateChanged((user) => {
      if (user) {
        _this.user = user
      } else {
        _this.user = null
        console.log('Firebase user sign out.')
      }
    })
  },
  mounted () {
    // hide lodaing modal
    this.isLoaded = true
    document.getElementById('wf-loading-modal').style.display = 'none'
  },
  methods: {
    signInWithGitHub () {
      const _this = this
      this.userApp.auth().signInWithPopup(this.firebaseGitHubProvider).then((result) => {
        // GitHub Access Token. You can use it to access the GitHub API.
        // var token = result.credential.accessToken
        // The signed-in user info.
        var user = result.user

        const { uid, displayName, email, photoURL } = user

        _this.userApp.database().ref('users/' + uid).once('value').then((snapshot) => {
          console.log('snapshot', snapshot.val())
          let oldValue = snapshot.val()
          let sites = []
          if (oldValue) {
            sites = oldValue.sites || []
          }
          _this.userApp.database().ref('users/' + uid).set({
            displayName,
            email,
            photoURL,
            sites
          })
          _this.user = user
        })
      }).catch((error) => {
        // Handle Errors here.
        // var errorCode = error.code
        var errorMessage = error.message
        // The email of the user's account used.
        var email = error.email
        // The firebase.auth.AuthCredential type that was used.
        // var credential = error.credential
        console.log(errorMessage)
        console.log(email)
      })
    },
    signOut () {
      this.user = null
      if (this.config.database === 'firebase') {
        this.userApp.auth().signOut().then(() => {
          // Sign-out successful.
          console.log('Firebase User Sign Out.')
        }).catch((error) => {
          // An error happened.
          console.log(error)
        })
      }
    }
  }
}
</script>

<style>
@import './assets/style.css'
</style>
