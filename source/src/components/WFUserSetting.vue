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
          <div class="form-itme-button align-for-profile">
            <i-button 
            type="primary" 
            @click="handleChangeProfile()" 
            :disabled="sendingProfile || avatarTesting" 
            :loading="sendingProfile">
              {{ $i18next.t('button/modify') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="sendingProfile">
              {{ $i18next.t('button/cancel') }}
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
            type="primary" 
            @click="handleChangeAccount()" 
            :disabled="sendingAccount || passwordTesting" 
            :loading="sendingAccount">
              {{ $i18next.t('button/modify') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="sendingAccount">
              {{ $i18next.t('button/cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Bus from '../bus'
import firebase from 'firebase'
import wilddog from 'wilddog'
export default {
  name: 'wf-user-setting',
  props: ['user'],
  data () {
    const _this = this
    const validateOldPassword = (rule, value, callback) => {
      this.passwordTesting = true
      let authService = this.$config.databaseProvider === 'firebase'
                      ? firebase.auth.EmailAuthProvider.credential
                      : wilddog.auth.WilddogAuthProvider.emailCredential
      const credential = authService(this.user.email, value)
      if (typeof (this.$auth.currentUser.reauthenticate) === 'function') {
        this.$auth.currentUser.reauthenticate(credential)
        .then(() => {
          this.passwordTesting = false
          callback()
        })
        .catch(() => {
          this.passwordTesting = false
          callback(new Error(_this.$i18next.t('error/wrongPassword')))
        })
      } else if (typeof (this.$auth.currentUser.reauthenticateWithCredential) === 'function') {
        this.$auth.currentUser.reauthenticateWithCredential(credential)
        .then(() => {
          this.passwordTesting = false
          callback()
        })
        .catch(() => {
          this.passwordTesting = false
          callback(new Error(_this.$i18next.t('error/wrongPassword')))
        })
      }
    }
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.accountForm.newPassword) {
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
      passwordTesting: false,
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
          { type: 'string', min: 6, message: _this.$i18next.t('error/passwordMin'), trigger: 'blur' },
          { validator: validateOldPassword, trigger: 'blur' }
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
  created () {
    Bus.$on('CurrentUserInfoUpdated', updates => {
      this.user.displayName = updates['/displayName']
      this.user.photoURL = updates['/photoURL']
    })
  },
  methods: {
    handleChangeProfile () {
      this.$refs['profileForm'].validate((valid) => {
        if (valid) {
          // this.sendingProfile = true
          const { displayName, photoURL } = this.profileForm
          const updates = {
            '/displayName': displayName,
            '/photoURL': photoURL
          }
          this.$database.ref(`/users/${this.user.uid}`).update(updates)
            .then(snapshot => {
              this.user.displayName = displayName
              this.user.photoURL = photoURL

              this.sendingProfile = false
              this.$Message.info(this.$i18next.t('message/updateSuccess'))

              // Broadcast 'CurrentUserInfoUpdated' event
              Bus.$emit('CurrentUserInfoUpdated', updates)
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
      this.$refs['accountForm'].validate((valid) => {
        if (valid) {
          this.sendingAccount = true
          const password = this.accountForm.newPassword
          this.$auth.currentUser.updatePassword(password).then(() => {
            this.sendingAccount = false
            this.$refs['accountForm'].resetFields()
            this.$Message.info(this.$i18next.t('message/passwordChanged'))
          }).catch((error) => {
            this.sendingAccount = false
            console.log(error.code, error.message)
            this.$refs['accountForm'].resetFields()
          })
        } else {
          this.$Message.error(this.$i18next.t('message/invalidForm'))
        }
      })
    },
    resetAvatar () {
      this.profileForm.photoURL = this.user.photoURL
      this.avatarTestURL = this.user.photoURL
      this.$refs.profileForm.validateField('photoURL')
    },
    closeModel () {
      this.$refs['accountForm'].resetFields()
      this.avatarTestURL = this.user.photoURL
      this.$parent.close()
    }
  }
}
</script>

<style scoped>
.form-warp { display: flex; flex-direction: row; width: 80%; height: 100%; margin: auto; padding-top: 10px; padding-bottom: 30px; align-items: center; align-items: space-between; }
.form-warp form { flex: 1 1 100%; }
.form-warp .avatar { position: relative; top: -16px; left: 10px; height: 100px; flex: 0 0 100px; }
.form-warp .avatar .ivu-avatar { width: 70px; height: 70px; border: 1px solid rgba(0, 0, 0, .2); }
.form-itme-button button { width: 25%; margin: 0 10px; }
.ivu-input-group-append .ivu-btn, .ivu-input-group-prepend .ivu-btn { margin: -7px; }
.align-for-profile { margin-right: -100px; }
</style>
