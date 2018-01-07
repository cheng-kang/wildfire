<template> 
  <i-tabs :value="initTab" class="wf-auth-form">
    <i-tab-pane :label="i18next.t('AuthForm.btn.sign_up')" name="sign_up" :disabled="loadingSignIn">
      <div class="wf-form-warp">
        <i-form ref="signUpForm" :model="signUpForm" :rules="rule" label-position="top">
          <i-form-item :label="i18next.t('AuthForm.label.email')" prop="email">
            <i-input type="text" v-model="signUpForm.email" :placeholder="i18next.t('AuthForm.placeholder.email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="i18next.t('AuthForm.label.password')" prop="password">
            <i-input type="password" v-model="signUpForm.password" :placeholder="i18next.t('AuthForm.placeholder.password')">
            </i-input>
          </i-form-item>
          <i-form-item :label="i18next.t('AuthForm.label.confirm_pwd')" prop="passwordCheck">
            <i-input type="password" v-model="signUpForm.passwordCheck" :placeholder="i18next.t('AuthForm.placeholder.confirm_pwd')">
            </i-input>
          </i-form-item>
          <div class="wf-buttons">
            <i-button
            type="primary" 
            @click="handleSignUp('signUpForm')" 
            :disabled="loadingSignUp"
            :loading="loadingSignUp">
              {{ i18next.t('AuthForm.btn.sign_up') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignUp">
              {{ i18next.t('AuthForm.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="i18next.t('AuthForm.btn.sign_in')" name="sign_in" :disabled="loadingSignUp">
      <div class="wf-form-warp">
        <i-form ref="signInForm" :model="signInForm" :rules="rule" label-position="top">
          <i-form-item :label="i18next.t('AuthForm.label.email')" prop="email">
            <i-input type="text" v-model="signInForm.email" :placeholder="i18next.t('AuthForm.placeholder.email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="i18next.t('AuthForm.label.password')" prop="password">
            <i-input type="password" v-model="signInForm.password" :placeholder="i18next.t('AuthForm.placeholder.password')">
            </i-input>
          </i-form-item>
          <div class="wf-buttons">
            <i-button 
            type="primary" 
            @click="handleSignIn('signInForm')" 
            :disabled="loadingSignIn" 
            :loading="loadingSignIn">
              {{ i18next.t('AuthForm.btn.sign_in') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignIn">
              {{ i18next.t('AuthForm.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import Bus from '../common/bus'
export default {
  name: 'wf-auth-form',
  props: ['initTab'],
  data () {
    const _i18next = Bus.i18next
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.signUpForm.password) {
        callback(new Error(_i18next.t('AuthForm.error.passwords_dont_match')))
      } else {
        callback()
      }
    }
    return {
      showModal: true,
      loadingSignUp: false,
      loadingSignIn: false,
      signInForm: {
        email: '',
        password: ''
      },
      signUpForm: {
        email: '',
        password: '',
        passwordCheck: ''
      },
      rule: {
        email: [
          { required: true, message: _i18next.t('AuthForm.error.empty_email'), trigger: 'blur' },
          { type: 'email', message: _i18next.t('AuthForm.error.invalid_email'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: _i18next.t('AuthForm.error.empty_pwd'), trigger: 'blur' },
          { type: 'string', min: 6, message: _i18next.t('AuthForm.error.password_min_length'), trigger: 'blur' }
        ],
        passwordCheck: [
          { required: true, message: _i18next.t('AuthForm.error.empty_confirm_pwd'), trigger: 'blur' },
          { validator: validatePasswordCheck, trigger: 'blur' }
        ]
      },
      shouldShowPassword: true
    }
  },
  computed: {
    bus: () => Bus,
    auth: () => Bus.auth,
    config: () => Bus.config,
    db: () => Bus.db,
    i18next: () => Bus.i18next
  },
  methods: {
    handleSignIn (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // hook: beforeSignIn
          const shouldContinue = (Bus.hooks.beforeSignIn || []).map(cb => cb({bus: this.bus})).reduce((a, b) => a && b, true)
          if (!shouldContinue) return

          this.loadingSignIn = true
          const email = this.signInForm.email
          const password = this.signInForm.password

          this.auth.signInWithEmailAndPassword(email, password)
          .then((user) => {
            this.db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
              this.loadingSignIn = false
              this.closeModel()
              this.$Message.info(this.i18next.t('AuthForm.success.signing_in'))

              // hook: signedIn
              const cbs = Bus.hooks.signedIn || []
              cbs.forEach(cb => cb({ bus: this.bus }))
            })
          }).catch(err => {
            this.loadingSignIn = false
            this.$Message.error(this.i18next.t('AuthForm.error.signing_in'))

            // hook: signedIn
            const cbs = Bus.hooks.signedIn || []
            cbs.forEach(cb => cb({ err, bus: this.bus }))
          })
        } else {
          this.$Message.error(this.i18next.t('AuthForm.error.invalid_form'))
        }
      })
    },
    handleSignUp (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // hook: beforeSignUp
          const shouldContinue = (Bus.hooks.beforeSignUp || []).map(cb => cb({ bus: this.bus })).reduce((a, b) => a && b, true)
          if (!shouldContinue) return

          this.loadingSignUp = true
          const email = this.signUpForm.email
          const password = this.signUpForm.password
          const displayName = email.split('@')[0]
          const photoURL = this.config.defaultAvatarURL

          this.auth.createUserWithEmailAndPassword(email, password)
          .then((user) => {
            let updates = {}
            updates['/displayName'] = displayName
            updates['/email'] = email
            updates['/photoURL'] = photoURL
            updates['/regDate'] = (new Date()).toISOString()

            this.db.ref(`/users/${user.uid}`).update(updates)
            .then(() => {
              this.loadingSignUp = false
              this.closeModel()
              this.$Message.info(this.i18next.t('AuthForm.success.signing_up'))

              // hook: signedUp
              const cbs = Bus.hooks.signedUp || []
              cbs.forEach(cb => cb({ bus: this.bus }))
            }).catch(err => {
              this.loadingSignUp = false
              this.$Message.error(this.i18next.t('AuthForm.error.unknown'))

              // hook: signedUp
              const cbs = Bus.hooks.signedUp || []
              cbs.forEach(cb => cb({ err, bus: this.bus }))
            })
          }).catch(err => {
            this.loadingSignUp = false
            var errorCode = err.code
            var errorMessage = err.message
            switch (errorCode) {
              case 'auth/email-already-in-use':
                errorMessage = this.i18next.t('AuthForm.error.email_already_in_use')
                break
              case 'auth/operation-not-allowed':
                errorMessage = this.i18next.t('AuthForm.error.operation_not_allowed')
                break
              case 'auth/weak-password':
                errorMessage = this.i18next.t('AuthForm.error.weak_password')
                break
              default:
                console.log(errorCode, error.message)
                errorMessage = this.i18next.t('AuthForm.error.unknown')
                break
            }
            this.$Message.error(errorMessage)

            // hook: signedUp
            const cbs = Bus.hooks.signedUp || []
            cbs.forEach(cb => cb({ err, bus: this.bus}))
          })
        } else {
          this.$Message.error(this.i18next.t('AuthForm.error.invalid_form'))
        }
      })
    },
    closeModel () {
      this.$refs['signInForm'].resetFields()
      this.$refs['signUpForm'].resetFields()
      this.$parent.close()
    }
  }
}
</script>
