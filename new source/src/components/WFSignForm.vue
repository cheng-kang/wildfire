<template> 
  <i-tabs :value="initTab">
    <i-tab-pane :label="$i18next.t('button/signIn')" name="signIn" :disabled="loadingSignUp">
      <i-card :bordered="false" :padding="40">
        <i-form ref="signInForm" :model="signInForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/email')" prop="email">
            <i-input type="text" v-model="signInForm.email" :placeholder="$i18next.t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/password')" prop="password">
            <i-input type="password" v-model="signInForm.password" :placeholder="$i18next.t('text/password')">
            </i-input>
          </i-form-item>
          <i-form-item>
              <i-button 
              type="primary" 
              @click="handleSignIn('signInForm')" 
              :disabled="loadingSignIn" 
              :loading="loadingSignIn">
                {{ $i18next.t('button/signIn') }}
              </i-button>
              <i-button 
              type="ghost" 
              @click="closeModel()" 
              :disabled="loadingSignIn">
                {{ $i18next.t('button/cancel') }}
              </i-button>
          </i-form-item>
        </i-form>
      </i-card>
    </i-tab-pane>

    <i-tab-pane :label="$i18next.t('button/signUp')" name="signUp" :disabled="loadingSignIn">
      <i-card :bordered="false">
        <i-form ref="signUpForm" :model="signUpForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/email')" prop="email">
            <i-input type="text" v-model="signUpForm.email" :placeholder="$i18next.t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/password')" prop="password">
            <i-input type="password" v-model="signUpForm.password" :placeholder="$i18next.t('text/password')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/confirm')" prop="passwordCheck">
            <i-input type="password" v-model="signUpForm.passwordCheck" :placeholder="$i18next.t('text/reEnterPassword')">
            </i-input>
          </i-form-item>
          <i-form-item>
              <i-button 
              type="primary" 
              @click="handleSignUp('signUpForm')" 
              :disabled="loadingSignUp"
              :loading="loadingSignUp">
                {{ $i18next.t('button/signUp') }} 
              </i-button>

              <i-button 
              type="ghost" 
              @click="closeModel()" 
              :disabled="loadingSignUp">
                {{ $i18next.t('button/cancel') }}
              </i-button>
          </i-form-item>
        </i-form>
      </i-card>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
export default {
  name: 'wf-sign-form',
  props: ['initTab'],
  data () {
    const _this = this
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.signUpForm.password) {
        callback(new Error(_this.$i18next.t('error/twoPasswordsDontMatch')))
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
    handleSignIn (name) {
      const _this = this
      this.$refs[name].validate((valid) => {
        if (valid) {
          _this.loadingSignIn = true
          const email = this.signInForm.email
          const password = this.signInForm.password
          _this.$auth.signInWithEmailAndPassword(email, password)
          .then((user) => {
            _this.$database.ref(`users/${user.uid}`).once('value').then((snapshot) => {
              _this.loadingSignIn = false
              _this.closeModel()
              _this.$Message.info(_this.$i18next.t('message/signInSuccess'))
            })
          }).catch((error) => {
            _this.loadingSignIn = false
            _this.$Message.error(_this.$i18next.t('message/signInFailed'))
            console.log(error.code, error.message)
          })
        } else {
          _this.$Message.error(_this.$i18next.t('message/invalidForm'))
        }
      })
    },
    handleSignUp (name) {
      const _this = this
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loadingSignUp = true
          const email = _this.signUpForm.email
          const password = _this.signUpForm.password
          const displayName = email.split('@')[0]
          const photoURL = _this.$config.defaultAvatarURL

          _this.$auth.createUserWithEmailAndPassword(email, password)
          .then((user) => {
            let updates = {}
            updates['/displayName'] = displayName
            updates['/email'] = email
            updates['/photoURL'] = photoURL

            _this.$database.ref(`/users/${user.uid}`).update(updates)
            .then(() => {
              _this.loadingSignUp = false
              _this.closeModel()
              _this.$Message.info(_this.$i18next.t('message/signUpSuccess'))
            }).catch((error) => {
              _this.loadingSignUp = false
              console.log(error.code, error.message)
              _this.$Message.error(_this.$i18next.t('message/somethingGoesWrong'))
            })
          }).catch((error) => {
            _this.loadingSignUp = false
            let errorCode = error.code
            let errorMessage = error.message
            switch (errorCode) {
              case 'auth/email-already-in-use':
                errorMessage = _this.$i18next.t('message/emailAlreadyInUse')
                break
              case 'auth/operation-not-allowed':
                errorMessage = _this.$i18next.t('message/operationNotAllowed')
                break
              case 'auth/weak-password':
                errorMessage = _this.$i18next.t('message/weakPassword')
                break
              default:
                break
            }
            _this.$Message.error(errorMessage)
          })
        } else {
          _this.$Message.error(_this.$i18next.t('message/invalidForm'))
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

<style scoped>
</style>