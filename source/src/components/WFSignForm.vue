<template> 
  <i-tabs :value="initTab">
        <i-tab-pane :label="$i18next.t('button/signUp')" name="signUp" :disabled="loadingSignIn">
      <div class="form-warp">
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
          <div class="form-itme-button">
            <i-button
            type="primary" 
            @click="handleSignUp('signUpForm')" 
            :disabled="loadingSignUp"
            :loading="loadingSignUp">
              {{ $i18next.t('button/signUp') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignUp">
              {{ $i18next.t('button/cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="$i18next.t('button/signIn')" name="signIn" :disabled="loadingSignUp">
      <div class="form-warp">
        <i-form ref="signInForm" :model="signInForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/email')" prop="email">
            <i-input type="text" v-model="signInForm.email" :placeholder="$i18next.t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/password')" prop="password">
            <i-input type="password" v-model="signInForm.password" :placeholder="$i18next.t('text/password')">
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button 
            type="primary" 
            @click="handleSignIn('signInForm')" 
            :disabled="loadingSignIn" 
            :loading="loadingSignIn">
              {{ $i18next.t('button/signIn') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignIn">
              {{ $i18next.t('button/cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
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
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loadingSignIn = true
          const email = this.signInForm.email
          const password = this.signInForm.password
          this.$auth.signInWithEmailAndPassword(email, password)
          .then((user) => {
            this.$database.ref(`users/${user.uid}`).once('value').then((snapshot) => {
              this.loadingSignIn = false
              this.closeModel()
              this.$Message.info(this.$i18next.t('message/signInSuccess'))
            })
          }).catch((error) => {
            this.loadingSignIn = false
            this.$Message.error(this.$i18next.t('message/signInFailed'))
            console.log(error.code, error.message)
          })
        } else {
          this.$Message.error(this.$i18next.t('message/invalidForm'))
        }
      })
    },
    handleSignUp (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.loadingSignUp = true
          const email = this.signUpForm.email
          const password = this.signUpForm.password
          const displayName = email.split('@')[0]
          const photoURL = this.$config.defaultAvatarURL

          this.$auth.createUserWithEmailAndPassword(email, password)
          .then((user) => {
            let updates = {}
            updates['/displayName'] = displayName
            updates['/email'] = email
            updates['/photoURL'] = photoURL
            updates['/regDate'] = (new Date()).toISOString()

            this.$database.ref(`/users/${user.uid}`).update(updates)
            .then(() => {
              this.loadingSignUp = false
              this.closeModel()
              this.$Message.info(this.$i18next.t('message/signUpSuccess'))
            }).catch((error) => {
              this.loadingSignUp = false
              console.log(error.code, error.message)
              this.$Message.error(this.$i18next.t('message/somethingGoesWrong'))
            })
          }).catch((error) => {
            this.loadingSignUp = false
            var errorCode = error.code
            var errorMessage = error.message
            switch (errorCode) {
              case 'auth/email-already-in-use':
                errorMessage = this.$i18next.t('message/emailAlreadyInUse')
                break
              case 'auth/operation-not-allowed':
                errorMessage = this.$i18next.t('message/operationNotAllowed')
                break
              case 'auth/weak-password':
                errorMessage = this.$i18next.t('message/weakPassword')
                break
              default:
                console.log(errorCode, error.message)
                errorMessage = this.$i18next.t('message/somethingGoesWrong')
                break
            }
            this.$Message.error(errorMessage)
          })
        } else {
          this.$Message.error(this.$i18next.t('message/invalidForm'))
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
.form-warp { display: flex; flex-direction: column; height: 100%; padding: 10px 50px 30px 50px; justify-content: center; }
.form-itme-button button { width: 25%; margin: 0 10px; }
</style>
