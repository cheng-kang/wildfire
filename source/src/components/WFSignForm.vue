<template> 
  <i-tabs value="signin">
    <i-tab-pane label="登录" name="signin">
      <i-card :bordered="false" :padding="40">
        <i-form ref="signinForm" :model="signinForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/email')" prop="email">
            <i-input type="text" v-model="signinForm.email" :placeholder="$i18next.t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/password')" prop="password">
            <i-input type="password" v-model="signinForm.password" :placeholder="$i18next.t('text/password')">
            </i-input>
          </i-form-item>
          <i-form-item>
              <i-button type="primary" @click="handleSignin">登录</i-button>
              <i-button type="ghost" @click="closeModel">取消</i-button>
          </i-form-item>
        </i-form>
      </i-card>
    </i-tab-pane>

    <i-tab-pane label="注册" name="signup">
      <i-card :bordered="false">
        <i-form ref="signupForm" :model="signupForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/email')" prop="email">
            <i-input type="text" v-model="signupForm.email" :placeholder="$i18next.t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/password')" prop="password">
            <i-input type="password" v-model="signupForm.password" :placeholder="$i18next.t('text/password')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/confirm')" prop="passwordCheck">
            <i-input type="password" v-model="signupForm.passwordCheck" :placeholder="$i18next.t('text/reEnterPassword')">
            </i-input>
          </i-form-item>
          <i-form-item>
              <i-button type="primary" @click="handleSignup">注册</i-button>
              <i-button type="ghost" @click="closeModel">取消</i-button>
          </i-form-item>
        </i-form>
      </i-card>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import uuidv5 from 'uuid/v5'
export default {
  name: 'wf-sign-form',
  data () {
    const _this = this
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.signupForm.password) {
        callback(new Error(_this.$i18next.t('error/twoPasswordsDontMatch')))
      } else {
        callback()
      }
    }
    return {
      showModal: true,
      signinForm: {
        email: '',
        password: ''
      },
      signupForm: {
        email: '',
        password: '',
        passwordCheck: ''
      },
      rule: {
        email: [
          { required: true, message: _this.$i18next.t('error/pleaseEnterEmail'), trigger: 'blur' },
          { type: 'email', message: _this.$i18next.t('error/invalidEmail'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: _this.$i18next.t('error/pleaseEnterPassword'), trigger: 'blur' },
          { type: 'string', min: 6, message: _this.$i18next.t('error/passwordMin'), trigger: 'blur' }
        ],
        passwordCheck: [
          { required: true, message: _this.$i18next.t('error/pleaseReEnterPassword'), trigger: 'blur' },
          { validator: validatePasswordCheck, trigger: 'blur' }
        ]
      },
      shouldShowPassword: true
    }
  },
  methods: {
    handleSignin () {
      // const email = signinForm.email
      // const password = this.encrypt(this.signinForm.password)
      console.log('123456')
    },
    handleSignup () {
      console.log(111)
      const email = this.signupForm.email
      const password = this.encrypt(this.signupForm.password)
      const displayName = email.split('@')[0]
      const photoURL = window._wildfire.config.defaultAvatarURL

      const namespace = uuidv4()
      const uid = uuidv5(email + new Date().getTime().toString(), namespace)

      this.signupForm = {
        email: '',
        password: '',
        passwordCheck: ''
      }
      console.log(email, password, displayName, photoURL, uid)

      const _this = this

      this.$userApp.database().ref(`/users/${uid}`).push({
        'email': email,
        'password': password,
        'displayName': displayName,
        'photoURL': photoURL
      }).then(() => {
        _this.$Message.info(_this.$i18next.t('message/signupSuccess'))
      }).catch((error) => {
        console.log(error)
        console.log(email)
        _this.$Message.error(_this.$i18next.t('message/signupFailed'))
      })
    },
    closeModel () {
      this.$parent.close()
    },
    encrypt (password) {
      var md5 = crypto.createHash('md5')
      var sha1 = crypto.createHash('sha1')
      md5.update(password)
      sha1.update(md5.digest('hex'))
      return sha1.digest('hex')
    }
  }
}
</script>

<style scoped>
</style>