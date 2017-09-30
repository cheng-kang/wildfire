// const wildfireConfig = {
//   database: 'wilddog',
//   databaseConfig: {
//     siteId: 'wd2231595668ouosqu'
//   },
//   pageURL: 'http://chengkang.me/wildfire',
//   pageTitle: 'Wildfire Demo',
//   locale: 'zh-CN'
// }

const wildfireConfig = {
  database: 'firebase',
  databaseConfig: {
    apiKey: 'AIzaSyCLsuRlCYjLyetc40v0-yFKHZVhumi85bs',
    authDomain: 'wildfirewebsite-35a4f.firebaseapp.com',
    databaseURL: 'https://wildfirewebsite-35a4f.firebaseio.com',
    projectId: 'wildfirewebsite-35a4f',
    storageBucket: '',
    messagingSenderId: '911552849262'
  },
  pageURL: 'http://chengkang.me/wildfire',
  pageTitle: 'Wildfire Demo',
  locale: 'zh-CN'
}

const {
  database,
  databaseConfig, // required
  pageTitle = document.title,
  pageURL = window.location.href,
  locale = 'en'
// } = window.wildfireConfig
} = wildfireConfig

Vue.prototype.$config = {
  database,
  databaseConfig,
  pageTitle,
  pageURL,
  locale,
  defaultAvatarURL: 'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/firefighter-avatar.png',
  anonymousUserIdPrefix: 'ANON:'
}

import Vue from 'vue'
import VueResource from 'vue-resource'
import wilddog from 'wilddog'
import VueWild from 'vuewild'
import firebase from 'firebase'
import VueFire from 'vuefire'
import moment from 'moment'
import i18next from 'i18next'
import App from './App'
import './assets/style.css'

Vue.config.productionTip = true
Vue.use(VueResource)
Vue.prototype.$i18next = i18next
Vue.prototype.$moment = moment

// Moved all iview injection into ./loadiView.js
// You can choose the component you want to use in that file.
import iView from './loadiView'
Vue.use(iView)

// import highlight from './highlight.js'
// Vue.use(highlight)

if (database === 'wilddog') {
  Vue.use(VueWild)
  Vue.prototype.$app = wilddog.initializeApp({
    authDomain: `${databaseConfig.siteId}.wilddog.com`,
    syncURL: `https://${databaseConfig.siteId}.wilddogio.com`
  })
  Vue.prototype.$database = Vue.prototype.$app.sync()
  Vue.prototype.$auth = Vue.prototype.$app.auth()
  Vue.prototype.$package = wilddog
} else if (database === 'firebase') {
  Vue.use(VueFire)
  Vue.prototype.$app = firebase.initializeApp(databaseConfig)
  Vue.prototype.$database = Vue.prototype.$app.database()
  Vue.prototype.$auth = Vue.prototype.$app.auth()
  Vue.prototype.$package = firebase
}

moment.locale(locale.toLowerCase())

i18next.init({
  lng: locale,
  fallbackLng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        'button/reply': 'Reply',
        'button/cancel': 'Cancel',
        'button/hide': 'Hide',
        'button/delete': 'Delete',
        'button/post': 'Post',
        'button/reset': 'Reset',
        'button/comments': 'Comments',
        'button/discussions': 'Discussions',
        'button/signUp': 'Sign Up',
        'button/signIn': 'Sign in',
        'button/modify': 'Modify',
        'button/signOut': 'Sign out',
        'button/posting': 'Posting',
        'button/profile': 'Profile',
        'button/account': 'Account',
        'button/showLessText': 'Show less text',
        'button/showFullText': 'Show full text',
        'button/reportThisComment': 'Report this comment',
        'switch/on': 'ON',
        'switch/off': 'OFF',
        'text/loading': 'Loading',
        'text/loadingComments': 'Loading comments',
        'textarea/joinTheConversation': 'Join the discusstion...',
        'textarea/joinTheConversationAnonymously': 'Join the discusstion as Anonymous User',
        'textarea/replyToUserComment': 'reply to {{username}}\'s comment',
        'text/anonymousUser': 'Anonymous User',
        'text/add_wildfire_to_your_site': 'Add Wildfire to your site',
        'text/postTheFirstComment': 'Post the first comment!',
        'text/showMoreDiscussion': 'Show more',
        'text/showLessDiscussion': 'Show less',
        'text/loadingCommentContent': 'Loading comment content...',
        'text/loadingUserData': 'Loading user data...',
        'text/commentPosted': 'Comment posted!',
        'text/areYouSureToDeleteThisComment': 'Are you sure to delete this comment?',
        'text/email': 'Email',
        'text/password': 'Password',
        'text/oldPassword': 'Old Password',
        'text/newPassword': 'New Password',
        'text/displayName': 'Nickname',
        'text/photoURL': 'Avatar URL',
        'text/reEnterPassword': 'Re-enter password',
        'text/confirm': 'Confirm',
        'text/signOutTitle': 'Sign Out',
        'text/signOutConfirmText': 'Are you sure to sign out Wildfire?',
        'text/pleaseSignIn': 'Please Sign In',
        'text/unSignInWarning': 'You need to Sign in first before modifying your profile.',
        'text/initializingMentionAutocomplete': 'Initializing Mention (@) auto-complete...',
        'text/mentionAutocompletePlaceholder': 'who do you want to mention?',
        'text/initializedMentionAutocomplete': 'Mention (@) auto-complete is on',
        'error/notValidServiceProvider': 'Please check your config: "sercice" should be "firebase" or "wilddog".',
        'error/noDatabaseConfig': 'Please check your config: missing "databaseConfig"',
        'error/failedToLoadComments': 'Failed to load comments.',
        'error/failedToPostComment': 'Failed to post comment.',
        'error/pleaseEnterEmail': 'Please enter your email.',
        'error/invalidEmail': 'Invalid email address.',
        'error/pleaseEnterPassword': 'Please enter your password.',
        'error/pleaseReEnterPassword': 'Please re-enter your password.',
        'error/twoPasswordsDontMatch': 'The two passwords don\'t match.',
        'error/passwordMin': 'Password should be at least 6 digits.',
        'error/invalidPhotoURL': 'Invalid Avatar URL!',
        'error/wrongPassword': 'Wrong password!',
        'error/mentionFuncNotAuthorized': 'Sign in to enable Mention (@)',
        'message/invalidForm': 'Invalid form! Check it and try again.',
        'message/signUpSuccess': 'Signup success!',
        'message/signUpFailed': 'Signup failed, please try again!',
        'message/signInSuccess': 'Signin success!',
        'message/signInFailed': 'Signin failed, please try again!',
        'message/emailAlreadyInUse': 'Email already in use, try to login!',
        'message/operationNotAllowed': 'Email accounts are not enabled, please contact the admin!',
        'message/updateSuccess': 'Update success',
        'message/somethingGoesWrong': 'Oops! Something goes wrong!',
        'message/passwordChanged': 'Password changed!',
        'message/reportCommentSucceeded': 'Comment reported.',
        'message/reportCommentFailed': 'Something went wrong, please try again later.'
      }
    },
    'zh-CN': {
      translation: {
        'button/reply': '回复',
        'button/cancel': '取消',
        'button/hide': '收起',
        'button/delete': '删除',
        'button/post': '发送',
        'button/reset': '清空',
        'button/comments': '条评论',
        'button/discussions': '条讨论',
        'button/signUp': '注册',
        'button/signIn': '登录',
        'button/modify': '修改',
        'button/signOut': '注销',
        'button/posting': '发送中',
        'button/profile': '普通设置',
        'button/account': '账号设置',
        'button/showLessText': '收起',
        'button/showFullText': '展开全部',
        'button/reportThisComment': '举报此条评论',
        'switch/on': '开',
        'switch/off': '关',
        'text/loading': '加载中',
        'text/loadingComments': '评论加载中',
        'textarea/joinTheConversation': '一起来发言吧...',
        'textarea/joinTheConversationAnonymously': '以 匿名用户 身份发言...',
        'textarea/replyToUserComment': '回复 {{username}} 的评论',
        'text/anonymousUser': '匿名用户',
        'text/add_wildfire_to_your_site': '在你的网站使用 Wildfire',
        'text/postTheFirstComment': '快来发布第一条评论吧！',
        'text/showMoreDiscussion': '展开更多讨论',
        'text/showLessDiscussion': '收起更多讨论',
        'text/loadingCommentContent': '加载评论内容中...',
        'text/loadingUserData': '加载用户数据中...',
        'text/commentPosted': '评论成功！',
        'text/areYouSureToDeleteThisComment': '你确定要删除这条评论吗？',
        'text/email': '电子邮箱',
        'text/password': '密码',
        'text/oldPassword': '原始密码',
        'text/newPassword': '新密码',
        'text/displayName': '昵称',
        'text/photoURL': '头像链接',
        'text/reEnterPassword': '再次输入密码',
        'text/confirm': '确认',
        'text/signOutTitle': '注销登录',
        'text/signOutConfirmText': '是否注销登录？',
        'text/pleaseSignIn': '请先登录',
        'text/unSignInWarning': '当前为匿名用户，您需要登录后才能进行个性化设置！',
        'text/initializingMentionAutocomplete': '初始化提及功能（@）自动补全中...',
        'text/initializedMentionAutocomplete': '提及功能（@）自动补全已启用',
        'text/mentionAutocompletePlaceholder': '你要 @ 谁？',
        'error/notValidServiceProvider': '请检查你的配置： "sercive" 应该为 "firebase" 或者 "wilddog"。',
        'error/noDatabaseConfig': '请检查你的配置： 找不到 "databaseConfig"',
        'error/failedToLoadComments': '加载评论失败。',
        'error/failedToPostComment': '发送评论失败。',
        'error/pleaseEnterEmail': '请输入你的邮箱地址。',
        'error/invalidEmail': '邮箱格式不正确。',
        'error/pleaseEnterPassword': '请输入你的密码。',
        'error/pleaseReEnterPassword': '请再次输入密码。',
        'error/twoPasswordsDontMatch': '两次输入的密码不一致。',
        'error/passwordMin': '密码长度不能小于6位。',
        'error/invalidPhotoURL': '不是有效的图片地址！',
        'error/wrongPassword': '密码错误！',
        'error/mentionFuncNotAuthorized': '登录以激活提及（@）功能',
        'message/invalidForm': '表单验证失败，请按要求填写！',
        'message/signUpSuccess': '注册成功！',
        'message/signUpFailed': '注册失败，请重试！',
        'message/signInSuccess': '登录成功！',
        'message/signInFailed': '登录失败，请重试！',
        'message/emailAlreadyInUse': '邮箱已经注册，请直接登录！',
        'message/operationNotAllowed': '邮箱登录被禁止，请联系站主！',
        'message/updateSuccess': '更新成功',
        'message/somethingGoesWrong': '发生了未知错误！',
        'message/passwordChanged': '密码修改成功！',
        'message/reportCommentSucceeded': '评论举报成功。',
        'message/reportCommentFailed': '出错了，请稍后再试。'
      }
    }
  }
}, (err, t) => {
  if (err) {
    console.error(err)
  } else {
    console.log('i18next Initialized!')
  }
})

Vue.prototype.$ip = 'unknown'
Vue.http.get('https://api.ipify.org?format=json').then(response => {
  // get body data
  Vue.prototype.$ip = response.body.ip
}, response => {
  // error callback
  console.log(response)
  Vue.prototype.$ip = 'unknown-failed'
})

/* eslint-disable no-new */
new Vue({
  el: '#wildfire',
  template: '<App/>',
  components: { App }
})
