(() => {
  // !!! should handle firebase init failure
  var firebaseApp = firebase.initializeApp(window._wildfire.config.databaseConfig)
  var db = firebaseApp.database()

  Vue.use(VueFire)
  Vue.prototype.$i18next = i18next
  Vue.prototype.$moment = moment

  Vue.component('wf-reply-area', {
    template: `
      <div class="wf-form" :class="{ 'wf-reply': isReply }">
        <img class="wf-avatar" :src="!user ? './static/wildfire-logo.svg' : user.photoURL">
        <div class="wf-textarea-wrapper">
          <span class="wf-textarea-placeholder" :class="{ inactive: !shouldShowPlaceholder }" @click="startEditing">
            {{$i18next.t('textarea/placeholder')}}
          </span>
          <div class="wf-textarea" :class="{ hasContent: !shouldShowPlaceholder || isReply }" :id="'wf-textarea-'+_uid" @blur="didEndEditing" contenteditable></div>
          <div class="wf-post-button-wrapper" :class="{ inactive: shouldShowPlaceholder && !isReply }">
            <button class="wf-post-button" @click="postComment">{{$i18next.t('button/post')}}</button>
          </div>
        </div>
      </div>
    `,
    props: ['user', 'replyToComment', 'rootComment'],
    data () {
      return {
        shouldShowPlaceholder: true,
        isReply: false
      }
    },
    computed: {
      textarea () {
        return document.getElementById(`wf-textarea-${this._uid}`)
      }
    },
    created () {
      this.isReply = !!this.replyToComment
    },
    methods: {
      startEditing () {
        this.textarea.focus()
        this.shouldShowPlaceholder = false
      },
      didEndEditing () {
        if (this.textarea.textContent === '') {
          this.shouldShowPlaceholder = true
        }
      },
      postComment () {
        const content = this.textarea.textContent
        this.textarea.textContent = ''
        const { siteId, pageURL } = window._wildfire.config
        if (content.trim() !== '') {
          const aDate = new Date()
          let author = this.user === null ? this.$i18next.t('text/anonymousUser') : this.user.displayName
          let authorUid = this.user === null ? 'anonymous' : this.user.uid
          let date = aDate.toISOString()
          let order = this.isReply ? null : -1 * aDate.getTime()
          let replyToId = null
          let replyToAuthor = null
          let refURL = ''
          console.log(this.replyToComment)
          console.log(this.rootComment)
          if (this.isReply) {
            replyToId = this.replyToComment['.key']
            replyToAuthor = this.replyToComment.author
          }
          if (!!this.rootComment) {
            refURL = `/sites/${siteId}/${btoa(pageURL)}/comments/${this.rootComment['.key']}/replies`
          } else if (this.isReply) {
            refURL = `/sites/${siteId}/${btoa(pageURL)}/comments/${this.replyToComment['.key']}/replies`
          } else {
            refURL = `/sites/${siteId}/${btoa(pageURL)}/comments`
          }
          const postData = { author, authorUid, date, order, content, replyToId, replyToAuthor }
          console.log(postData)
          db.ref(refURL).push().set(postData)
          return
        }
      }
    }
  })
  Vue.component('wf-comment-card', {
    template: `
      <li class="wf-comment-item" :class="{ reply: comment.parentId !== undefined }">
        <div class="wf-comment-avatar">
          <img :src="avatarURL">
        </div>
        <div class="wf-comment-body">
          <header>
            <div class="header-content">
              <span class="username"><a href="#">{{authorUsername}}</a></span>
              <span class="parent-link" v-if="comment.replyToAuthor !== undefined">➦ {{comment.replyToAuthor}}</span>
              <span class="meta">· {{$moment(comment.date).fromNow()}}</span>
            </div>
            <div class="header-menu">
              <span class="menu-button" 
                :class="{ active: isHeaderMenuShowing }" 
                @click="isHeaderMenuShowing = !isHeaderMenuShowing"
              >▼</span>
              <ul class="menu-dropdown" :class="{ inactive: !isHeaderMenuShowing }">
                <li>
                  <a href="#">report</a>
                </li>
                <li>
                  <a href="#">ban user</a>
                </li>
              </ul>
            </div>
          </header>
          <div class="wf-comment-content">{{comment.content}}</div>
          <footer>
            <span class="like-count" :class="{ inactive: likeUserIdList.indexOf(currentUserId) === -1}">
              {{likeUserIdList.length || ''}}
            </span>
            <a href="#" 
              :class="{ 
                inactive: likeUserIdList.indexOf(currentUserId) === -1,
                disabled: !user
              }"
              :id="'like-'+comment['.key']"
              @click="toogleLikeComment"
            > 👍</a>
            <span class="separator"></span>
            <span class="dislike-count inactive" :class="{ inactive: dislikeUserIdList.indexOf(currentUserId) === -1}">
              {{dislikeUserIdList.length || ''}}
            </span>
            <a href="#"
              :class="{ 
                inactive: dislikeUserIdList.indexOf(currentUserId) === -1,
                disabled: !user
              }"
              :id="'dislike-'+comment['.key']"
              @click="toogleDislikeComment"
            >👎</a>
            <span class="bullet">·</span>
            <a class="wf-button wf-reply-button" :class="{ active: isReplying }" href="#" @click="isReplying = !isReplying">
              {{isReplying ? $i18next.t('button/cancel') : $i18next.t('button/reply')}}
            </a>
            <template v-if="user && (user.uid === comment.uid)">
              <span class="bullet">·</span>
              <a class="wf-button wf-delete-button" href="#">{{$i18next.t('button/delete')}}</a>
            </template>
          </footer>
          <wf-reply-area v-if="!parentComment"
            v-show="isReplying" 
            :user="user" 
            :reply-to-comment="comment">
          </wf-reply-area>
          <wf-reply-area v-if="!!parentComment"
            v-show="isReplying" 
            :user="user" 
            :reply-to-comment="comment"
            :root-comment="parentComment">
          </wf-reply-area>
        </div>
      </li>
    `,
    props: ['comment', 'parentComment', 'user'],
    data () {
      return {
        isHeaderMenuShowing: false,
        isReplying: false,
        avatarURL: window._wildfire.config.defaultAvatar,
        authorUsername: ''
      }
    },
    computed: {
      likeUserIdList () {
        return this.comment.likes === undefined ? [] : Object.keys(this.comment.likes)
      },
      dislikeUserIdList () {
        return this.comment.dislikes === undefined ? [] : Object.keys(this.comment.dislikes)
      },
      currentUserId () {
        return this.user ? this.user.uid : 'null'
      }
    },
    created () {
      this.authorUsername = this.$i18next.t('text/anonymousUser')
      const uid = this.comment.authorUid
      if (uid === window._wildfire.config.anonymousUserId) { return }

      const _this = this
      window._wildfire.userApp.database().ref(`users/${uid}`).once('value').then((snapshot) => {
        let author = snapshot.val()
        if (!author) { return }
        if (author.photoURL) {
          _this.avatarURL = author.photoURL
        }
        if (author.displayName) {
          _this.authorUsername = author.displayName
        }
      })
    },
    methods: {
      toogleLikeComment () {
        if (!this.user) { return }
        const likes = this.comment.likes || []
        const { siteId, pageURL } = window._wildfire.config
        const commentId = this.comment['.key']
        const { uid } = this.user
        if (this.likeUserIdList.indexOf(uid) === -1) {
          const refURL = !!this.parentComment 
          ? `/sites/${siteId}/${btoa(pageURL)}/comments/${this.parentComment['.key']}/replies/${commentId}/likes/${uid}` 
          : `/sites/${siteId}/${btoa(pageURL)}/comments/${this.comment['.key']}/likes/${uid}`
          console.log(refURL)
          const shouldRemoveDislike = this.dislikeUserIdList.indexOf(uid) !== -1
          db.ref(refURL).set((new Date()).toISOString()).then(() => {
            if (shouldRemoveDislike) {
              document.getElementById(`dislike-${commentId}`).click()
            }
          })
        } else {
          const refURL = !!this.parentComment 
          ? `/sites/${siteId}/${btoa(pageURL)}/comments/${this.parentComment['.key']}/replies/${commentId}/likes/${uid}` 
          : `/sites/${siteId}/${btoa(pageURL)}/comments/${this.comment['.key']}/likes/${uid}`
          console.log(refURL)
          db.ref(refURL).remove()
        }
      },
      toogleDislikeComment () {
        if (!this.user) { return }
        const dislikes = this.comment.dislikes || []
        const { siteId, pageURL } = window._wildfire.config
        const commentId = this.comment['.key']
        const { uid } = this.user
        if (this.dislikeUserIdList.indexOf(uid) === -1) {
          const refURL = !!this.parentComment ? 
          `/sites/${siteId}/${btoa(pageURL)}/comments/${this.parentComment['.key']}/replies/${commentId}/dislikes/${uid}`
          : `/sites/${siteId}/${btoa(pageURL)}/comments/${this.comment['.key']}/dislikes/${uid}`
          const shouldRemoveLike = this.likeUserIdList.indexOf(uid) !== -1
          db.ref(refURL).set((new Date()).toISOString()).then(() => {
            if (shouldRemoveLike) {
              document.getElementById(`like-${commentId}`).click()
            }
          })
        } else {
          const refURL = !!this.parentComment ? 
          `/sites/${siteId}/${btoa(pageURL)}/comments/${this.parentComment['.key']}/replies/${commentId}/dislikes`
          : `/sites/${siteId}/${btoa(pageURL)}/comments/${this.comment['.key']}/dislikes`
          console.log(refURL)
          db.ref(refURL).remove()
        }
      }
    }
  })

  var app = new Vue({
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
})()