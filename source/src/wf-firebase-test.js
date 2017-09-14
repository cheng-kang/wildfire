Vue.use(VueFire)
Vue.prototype.$i18next = i18next
Vue.prototype.$moment = moment

export default () => {
  new Vue({
    el: '#wild-fire',
    data: {
      isLoaded: false,
      userApp: null,
      firebaseGitHubProvider: null,
      config: null,
      user: null
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
        comments: db.ref(`sites/${window._wildfire.config.siteId}/${btoa(window._wildfire.config.pageURL)}/comments`).orderByChild('order')
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
      this.userApp.auth().onAuthStateChanged( (user) => {
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
          var token = result.credential.accessToken
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
        }).catch((error) =>{
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
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
          });
        }
      }
    }
  })
}
