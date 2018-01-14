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
import { beforeEvent, afterEvent } from '../common/utils'
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

          const email = this.signInForm.email
          const password = this.signInForm.password
          this.loadingSignIn = true

          // event: beforeSignIn
          const shouldContinue = beforeEvent('beforeSignIn', { email }, this.bus)
          if (!shouldContinue) {
            this.loadingSignIn = false
            return
          }

          this.auth.signInWithEmailAndPassword(email, password)
          .then((user) => {
            this.db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
              this.loadingSignIn = false
              this.closeModel()
              this.$Message.info(this.i18next.t('AuthForm.success.signing_in'))

              // event: signedIn
              afterEvent('signedIn', {user}, this.bus)
            })
          }).catch(error => {
            this.loadingSignIn = false
            this.$Message.error(this.i18next.t('AuthForm.error.signing_in'))

            // event: signedIn
            afterEvent('signedIn', { error }, this.bus)
          })
        } else {
          this.$Message.error(this.i18next.t('AuthForm.error.invalid_form'))
        }
      })
    },
    handleSignUp (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const email = this.signUpForm.email
          const password = this.signUpForm.password
          const displayName = email.split('@')[0]
          const photoURL = this.config.defaultAvatarURL
          this.loadingSignUp = true
          // event: beforeSignUp
          const shouldContinue = beforeEvent('beforeSignUp', {email}, this.bus)
          if (!shouldContinue) {
            this.loadingSignUp = false
            return
          }

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

              // event: signedUp
              afterEvent('signedUp', {email}, this.bus)

            }).catch(error => {
              this.loadingSignUp = false
              this.$Message.error(this.i18next.t('AuthForm.error.unknown'))

              // event: signedUp
              afterEvent('signedUp', { error }, this.bus)
            })
          }).catch(error => {
            this.loadingSignUp = false
            var errorCode = error.code
            var errorMessage = error.message
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

            // event: signedUp
            afterEvent('signedUp', { error }, this.bus)
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
