<template>
  <header>
    <i-menu mode="horizontal" theme="light" active-name="1">
      <i-menu-item name="1">
        <i-spin v-if="commentsLoadingState === 'loading'"
          :defaultSlotStyle="{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
            }">
            <i-icon type="load-c" size=18 class="spin-icon" :style="{marginRight: '5px'}"></i-icon>
            <div>{{$i18next.t('text/loadingComments')}}</div>
        </i-spin>
        <span v-else>{{commentCount}} {{$i18next.t('button/comments')}}</span>
      </i-menu-item>
      <i-menu-item name="2">
          {{username}}
      </i-menu-item>
      <div class="wf-nav-right">
        <span v-show="!user" >
          <a @click="signUp">
            {{$i18next.t('button/signUp')}}
          </a>
          <span>/</span>
          <a @click="signInFirebaseWithGitHub">
            {{$i18next.t('button/signIn')}}
          </a>
        </span>
        <a v-show="user" 
          @click="signOut">
          {{$i18next.t('button/signOut')}}
        </a>
      </div>
    </i-menu>
  </header>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'wf-header',
  props: ['user', 'commentCount', 'commentsLoadingState'],
  computed: {
    username () {
      return this.user
      ? this.user.displayName
      : this.$i18next.t('text/anonymousUser')
    }
  },
  methods: {
    signUp () {
      // sign up
    },
    signInFirebaseWithGitHub ({state, commit}) {
      const _this = this
      this.$userApp.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()).then((result) => {
        var user = result.user

        const { uid, displayName, email, photoURL } = user

        /**
         *  Check if there is any change to userinfo,
         *  and update USER_DB correspondingly.
         */
        _this.$userApp.database().ref('users/' + uid).once('value').then((snapshot) => {
          let oldValue = snapshot.val()

          let updates = {}
          if (oldValue.displayName !== displayName) {
            updates['/displayName'] = displayName
          }
          if (oldValue.email !== email) {
            updates['/email'] = email
          }
          if (oldValue.photoURL !== photoURL) {
            updates['/photoURL'] = photoURL
          }

          _this.$userApp.database().ref('users/' + uid).update(updates)
        })
      }).catch((error) => {
        /**
         * Handle errors here
         */
        var errorMessage = error.message
        var email = error.email
        console.log(errorMessage)
        console.log(email)
      })
    },
    signOut () {
      const { database } = this.$config
      if (database === 'firebase') {
        this.$userApp.auth().signOut().then(() => {
          console.log('Firebase User Sign Out.')
        }).catch((error) => {
          console.log(error)
        })
      } else {
        // if database === 'wilddog'
      }
    }
  }
}
</script>

<style scoped>
header {
  margin-bottom: 30px;
}
.wf-nav-right {
  float: right;
}
</style>