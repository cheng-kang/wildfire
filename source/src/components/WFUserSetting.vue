<style scoped>
.form-warp{
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-items: space-between;
  width: 80%;
  margin: auto;
  padding-top: 10px;
  padding-bottom: 30px
}
.form-warp form{
  flex: 1 1 100%;
}
.form-warp .avatar{
  flex: 0 0 100px;
  height: 100px;
  position: relative;
  top: -16px;
  left: 10px
}
.form-warp .avatar .ivu-avatar{
  width: 70px;
  height: 70px;
  border: 1px solid rgba(0,0,0,0.2)
}
.form-itme-button button{
  margin: 0 10px;
  width: 25%;
}
.ivu-input-group-append .ivu-btn, .ivu-input-group-prepend .ivu-btn {
  margin: -7px
}
</style>
<template> 
  <i-tabs value="profile">
    <i-tab-pane :label="$i18next.t('button/profile')" name="profile" :disabled="sendingAccount">
      <div class="form-warp">
        <i-form ref="profileForm" :model="profileForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/displayName')" prop="displayName">
            <i-input type="text" v-model="profileForm.displayName" :placeholder="$i18next.t('text/displayName')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/photoURL')" prop="photoURL">
            <i-input type="text" v-model="profileForm.photoURL" :placeholder="$i18next.t('text/photoURL')">
              <i-button slot="append" icon="refresh" @click="resetAvatar"></i-button>
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button 
            type="ghost" 
            @click="closeModel()" 
            :disabled="sendingProfile">
              {{ $i18next.t('button/cancel') }}
            </i-button>
            <i-button 
            type="primary" 
            @click="handleChangeProfile()" 
            :disabled="sendingProfile || avatarTesting" 
            :loading="sendingProfile">
              {{ $i18next.t('button/modify') }}
            </i-button>
          </div>
        </i-form>
        <div class="avatar">
          <i-avatar shape="square" style="background: #fff" :src="avatarTestURL" />
        </div>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="$i18next.t('button/account')" name="account" :disabled="sendingProfile">
      <div class="form-warp">
        <i-form ref="accountForm" :model="accountForm" :rules="rule" :label-width="80">
          <i-form-item :label="$i18next.t('text/oldPassword')" prop="oldPassword">
            <i-input type="password" v-model="accountForm.oldPassword" :placeholder="$i18next.t('text/oldPassword')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/newPassword')" prop="newPassword">
            <i-input type="password" v-model="accountForm.newPassword" :placeholder="$i18next.t('text/newPassword')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('text/confirm')" prop="passwordCheck">
            <i-input type="password" v-model="accountForm.passwordCheck" :placeholder="$i18next.t('text/reEnterPassword')">
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button 
            type="ghost" 
            @click="closeModel()" 
            :disabled="sendingAccount">
              {{ $i18next.t('button/cancel') }}
            </i-button>

            <i-button
            type="primary" 
            @click="handleChangeAccount()" 
            :disabled="sendingAccount"
            :loading="sendingAccount">
              {{ $i18next.t('button/modify') }} 
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
export default {
  name: 'wf-user-setting',
  props: ['user'],
  data () {
    const _this = this
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.signUpForm.password) {
        callback(new Error(_this.$i18next.t('error/twoPasswordsDontMatch')))
      } else {
        callback()
      }
    }
    const validatePhotoURL = (rule, value, callback) => {
      this.avatarTesting = true
      var avatar = new Image()
      avatar.src = value
      avatar.onload = () => {
        this.avatarTestURL = value
        this.avatarTesting = false
        callback()
      }
      avatar.onerror = () => {
        this.avatarTestURL = this.user.photoURL
        this.avatarTesting = false
        callback(new Error(_this.$i18next.t('error/invalidPhotoURL')))
      }
    }
    const validateDisplayName = (rule, value, callback) => {
      callback()
    }
    return {
      avatarTesting: false,
      sendingProfile: false,
      sendingAccount: false,
      avatarTestURL: this.user.photoURL,
      profileForm: {
        displayName: this.user.displayName,
        photoURL: this.user.photoURL
      },
      accountForm: {
        oldPassword: '',
        newPassword: '',
        passwordCheck: ''
      },
      rule: {
        displayName: [
          { required: true, message: '', trigger: 'blur' },
          { validator: validateDisplayName, trigger: 'blur' }
        ],
        photoURL: [
          { required: true, message: '', trigger: 'blur' },
          { validator: validatePhotoURL, trigger: 'blur' }
        ],
        oldPassword: [
          { required: true, message: _this.$i18next.t('error/pleaseEnterPassword'), trigger: 'blur' },
          { type: 'string', min: 6, message: _this.$i18next.t('error/passwordMin'), trigger: 'blur' }
        ],
        newPassword: [
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
  // watch
  methods: {
    handleChangeProfile () {
      this.$refs['profileForm'].validate((valid) => {
        if (valid) {
          // this.sendingProfile = true
          const { displayName, photoURL } = this.profileForm
          const updates = {
            '/displayName': displayName,
            'photoURL': photoURL
          }
          this.$database.ref(`/users/${this.user.uid}`).update(updates)
            .then(() => {
              this.sendingProfile = false
              this.$Message.info(this.$i18next.t('message/updateSuccess'))
              setTimeout(() => {
                location.reload()
              }, 500)
            }).catch((error) => {
              this.sendingProfile = false
              console.log(error.code, error.message)
              this.$Message.error(this.$i18next.t('message/somethingGoesWrong'))
            })
        } else {
          this.$Message.error(this.$i18next.t('message/invalidForm'))
        }
      })
    },
    handleChangeAccount () {
      console.log(this.user)
      // this.$refs[name].validate((valid) => {
      //   if (valid) {
      //     this.loadingSignUp = true
      //     const email = this.signUpForm.email
      //     const password = this.signUpForm.password
      //     const displayName = email.split('@')[0]
      //     const photoURL = this.$config.defaultAvatarURL

      //     this.$auth.createUserWithEmailAndPassword(email, password)
      //     .then((user) => {
      //       let updates = {}
      //       updates['/displayName'] = displayName
      //       updates['/email'] = email
      //       updates['/photoURL'] = photoURL

      //       this.$database.ref(`/users/${user.uid}`).update(updates)
      //       .then(() => {
      //         this.loadingSignUp = false
      //         this.closeModel()
      //         this.$Message.info(this.$i18next.t('message/signUpSuccess'))
      //       }).catch((error) => {
      //         this.loadingSignUp = false
      //         console.log(error.code, error.message)
      //         this.$Message.error(this.$i18next.t('message/somethingGoesWrong'))
      //       })
      //     }).catch((error) => {
      //       this.loadingSignUp = false
      //       var errorCode = error.code
      //       var errorMessage = error.message
      //       switch (errorCode) {
      //         case 'auth/email-already-in-use':
      //           errorMessage = this.$i18next.t('message/emailAlreadyInUse')
      //           break
      //         case 'auth/operation-not-allowed':
      //           errorMessage = this.$i18next.t('message/operationNotAllowed')
      //           break
      //         case 'auth/weak-password':
      //           errorMessage = this.$i18next.t('message/weakPassword')
      //           break
      //         default:
      //           console.log(errorCode, error.message)
      //           errorMessage = this.$i18next.t('message/somethingGoesWrong')
      //           break
      //       }
      //       this.$Message.error(errorMessage)
      //     })
      //   } else {
      //     this.$Message.error(this.$i18next.t('message/invalidForm'))
      //   }
      // })
    },
    resetAvatar () {
      this.profileForm.photoURL = this.user.photoURL
      this.avatarTestURL = this.user.photoURL
      this.$refs.profileForm.validateField('photoURL')
    },
    closeModel () {
      this.$refs['profileForm'].resetFields()
      this.$refs['accountForm'].resetFields()
      this.avatarTestURL = this.user.photoURL
      this.$parent.close()
    }
  }
}
</script>
