<template> 
  <i-tabs :value="initTab">
        <i-tab-pane :label="$t('button/signUp')" name="signUp" :disabled="loadingSignIn">
      <div class="form-warp">
        <i-form ref="signUpForm" :model="signUpForm" :rules="rule" :label-width="80">
          <i-form-item :label="$t('text/email')" prop="email">
            <i-input type="text" v-model="signUpForm.email" :placeholder="$t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$t('text/password')" prop="password">
            <i-input type="password" v-model="signUpForm.password" :placeholder="$t('text/password')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$t('text/confirm')" prop="passwordCheck">
            <i-input type="password" v-model="signUpForm.passwordCheck" :placeholder="$t('text/reEnterPassword')">
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button
            type="primary" 
            @click="handleSignUp('signUpForm')" 
            :disabled="loadingSignUp"
            :loading="loadingSignUp">
              {{ $t('button/signUp') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignUp">
              {{ $t('button/cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="$t('button/signIn')" name="signIn" :disabled="loadingSignUp">
      <div class="form-warp">
        <i-form ref="signInForm" :model="signInForm" :rules="rule" :label-width="80">
          <i-form-item :label="$t('text/email')" prop="email">
            <i-input type="text" v-model="signInForm.email" :placeholder="$t('text/email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$t('text/password')" prop="password">
            <i-input type="password" v-model="signInForm.password" :placeholder="$t('text/password')">
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button 
            type="primary" 
            @click="handleSignIn('signInForm')" 
            :disabled="loadingSignIn" 
            :loading="loadingSignIn">
              {{ $t('button/signIn') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="loadingSignIn">
              {{ $t('button/cancel') }}
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
        callback(new Error(_this.$t('error/twoPasswordsDontMatch')))
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
          { required: true, message: _this.$t('error/pleaseEnterEmail'), trigger: 'blur' },
          { type: 'email', message: _this.$t('error/invalidEmail'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: _this.$t('error/pleaseEnterPassword'), trigger: 'blur' },
          { type: 'string', min: 6, message: _this.$t('error/passwordMin'), trigger: 'blur' }
        ],
        passwordCheck: [
          { required: true, message: _this.$t('error/pleaseReEnterPassword'), trigger: 'blur' },
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
              this.$Message.info(this.$t('message/signInSuccess'))
            })
          }).catch((error) => {
            this.loadingSignIn = false
            this.$Message.error(this.$t('message/signInFailed'))
            console.log(error.code, error.message)
          })
        } else {
          this.$Message.error(this.$t('message/invalidForm'))
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
              this.$Message.info(this.$t('message/signUpSuccess'))
            }).catch((error) => {
              this.loadingSignUp = false
              console.log(error.code, error.message)
              this.$Message.error(this.$t('message/somethingGoesWrong'))
            })
          }).catch((error) => {
            this.loadingSignUp = false
            var errorCode = error.code
            var errorMessage = error.message
            switch (errorCode) {
              case 'auth/email-already-in-use':
                errorMessage = this.$t('message/emailAlreadyInUse')
                break
              case 'auth/operation-not-allowed':
                errorMessage = this.$t('message/operationNotAllowed')
                break
              case 'auth/weak-password':
                errorMessage = this.$t('message/weakPassword')
                break
              default:
                console.log(errorCode, error.message)
                errorMessage = this.$t('message/somethingGoesWrong')
                break
            }
            this.$Message.error(errorMessage)
          })
        } else {
          this.$Message.error(this.$t('message/invalidForm'))
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
.form-warp{
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 50px 30px 50px
}
.form-itme-button button{
  margin: 0 10px;
  width: 25%;
}
</style>
