<template> 
  <i-tabs class="wf-user-setting">
    <i-tab-pane :label="$i18next.t('UserSetting.tab.profile')" name="profile" :disabled="updatingAccount">
      <div class="form-warp" :class="{ 'small-screen': isSmallScreen }">
        <i-form ref="profileForm" :model="profileForm" :rules="rule" label-position="top">
          <i-form-item :label="$i18next.t('UserSetting.label.display_name')" prop="displayName">
            <i-input type="text" v-model="profileForm.displayName" :placeholder="$i18next.t('UserSetting.placeholder.display_name')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('UserSetting.label.photo_url')" prop="photoURL">
            <i-input type="text" v-model="profileForm.photoURL" :placeholder="$i18next.t('UserSetting.placeholder.photo_url')">
              <i-button slot="append" icon="refresh" @click="resetAvatar"></i-button>
            </i-input>
          </i-form-item>
          <div class="form-itme-button align-for-profile">
            <i-button 
            type="primary" 
            @click="handleChangeProfile()" 
            :disabled="updatingProfile || avatarTesting" 
            :loading="updatingProfile">
              {{ $i18next.t('UserSetting.btn.update') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="updatingProfile">
              {{ $i18next.t('UserSetting.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
        <div class="avatar">
          <i-avatar shape="square" style="background: #fff" :src="avatarTestURL" />
        </div>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="$i18next.t('UserSetting.tab.account')" name="account" :disabled="updatingProfile">
      <div class="form-warp">
        <i-form ref="accountForm" :model="accountForm" :rules="rule" label-position="top">
          <i-form-item :label="$i18next.t('UserSetting.label.old_pwd')" prop="oldPassword">
            <i-input type="password" v-model="accountForm.oldPassword" :placeholder="$i18next.t('UserSetting.placeholder.old_pwd')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('UserSetting.label.new_pwd')" prop="newPassword">
            <i-input type="password" v-model="accountForm.newPassword" :placeholder="$i18next.t('UserSetting.placeholder.new_pwd')">
            </i-input>
          </i-form-item>
          <i-form-item :label="$i18next.t('UserSetting.label.confirm_pwd')" prop="passwordCheck">
            <i-input type="password" v-model="accountForm.passwordCheck" :placeholder="$i18next.t('UserSetting.placeholder.confirm_pwd')">
            </i-input>
          </i-form-item>
          <div class="form-itme-button">
            <i-button
            type="primary" 
            @click="handleChangeAccount()" 
            :disabled="updatingAccount || passwordTesting" 
            :loading="updatingAccount">
              {{ $i18next.t('UserSetting.btn.update') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="updatingAccount">
              {{ $i18next.t('UserSetting.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Bus from '../common/bus'
import WfTip from './WfTip'
export default {
  name: 'wf-user-setting',
  components: { WfTip },
  props: ['user'],
  data () {
    const _i18next = this.$_wf.i18next
    const validateOldPassword = (rule, value, callback) => {
      this.passwordTesting = true
      const credential = this.$_wf.authService(this.user.email, value)
      if (typeof (this.$auth.currentUser.reauthenticate) === 'function') {
        this.$auth.currentUser.reauthenticate(credential)
        .then(() => {
          this.passwordTesting = false
          callback()
        })
        .catch(() => {
          this.passwordTesting = false
          callback(new Error(_i18next.t('UserSetting.error.password')))
        })
      } else if (typeof (this.$auth.currentUser.reauthenticateWithCredential) === 'function') {
        this.$auth.currentUser.reauthenticateWithCredential(credential)
        .then(() => {
          this.passwordTesting = false
          callback()
        })
        .catch(() => {
          this.passwordTesting = false
          callback(new Error(_i18next.t('UserSetting.error.password')))
        })
      }
    }
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.accountForm.newPassword) {
        callback(new Error(_i18next.t('UserSetting.error.passwords_dont_match')))
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
        callback(new Error(_i18next.t('UserSetting.error.invalid_photo_url')))
      }
    }
    const validateDisplayName = (rule, value, callback) => {
      callback()
    }
    return {
      avatarTesting: false,
      passwordTesting: false,
      updatingProfile: false,
      updatingAccount: false,
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
          { required: true, message: _i18next.t('UserSetting.error.empty_old_pwd'), trigger: 'blur' },
          { type: 'string', min: 6, message: _i18next.t('UserSetting.error.password_min_length'), trigger: 'blur' },
          { validator: validateOldPassword, trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: _i18next.t('UserSetting.error.empty_new_pwd'), trigger: 'blur' },
          { type: 'string', min: 6, message: _i18next.t('UserSetting.error.password_min_length'), trigger: 'blur' }
        ],
        passwordCheck: [
          { required: true, message: _i18next.t('UserSetting.error.empty_confirm_pwd'), trigger: 'blur' },
          { validator: validatePasswordCheck, trigger: 'blur' }
        ]
      },
      shouldShowPassword: true
    }
  },
  computed: {
    $auth () {
      return this.$_wf.auth
    },
    $config () {
      return this.$_wf.config
    },
    $db () {
      return this.$_wf.db
    },
    $i18next () {
      return this.$_wf.i18next
    },
    windowWidth: () => Bus.$data.windowWidth,
    isSmallScreen () {
      // <= screen width of iPhone 6 plus
      return this.windowWidth <= 414
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
          // this.updatingProfile = true
          const { displayName, photoURL } = this.profileForm
          const updates = {
            '/displayName': displayName,
            '/photoURL': photoURL
          }
          this.$db.ref(`/users/${this.user.uid}`).update(updates)
            .then(snapshot => {
              this.user.displayName = displayName
              this.user.photoURL = photoURL

              this.updatingProfile = false
              this.$Message.info(this.$i18next.t('UserSetting.success.updating_profile'))

              // Broadcast 'CurrentUserInfoUpdated' event
              Bus.$emit('CurrentUserInfoUpdated', updates)
            }).catch((error) => {
              this.updatingProfile = false
              console.log(error.code, error.message)
              this.$Message.error(this.$i18next.t('UserSetting.error.unknown'))
            })
        } else {
          this.$Message.error(this.$i18next.t('UserSetting.error.invalid_form'))
        }
      })
    },
    handleChangeAccount () {
      this.$refs['accountForm'].validate((valid) => {
        if (valid) {
          this.updatingAccount = true
          const password = this.accountForm.newPassword
          this.$auth.currentUser.updatePassword(password).then(() => {
            this.updatingAccount = false
            this.$refs['accountForm'].resetFields()
            this.$Message.info(this.$i18next.t('UserSetting.success.changing_password'))
          }).catch((error) => {
            this.updatingAccount = false
            console.log(error.code, error.message)
            this.$refs['accountForm'].resetFields()
          })
        } else {
          this.$Message.error(this.$i18next.t('UserSetting.error.invalid_form'))
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
<style>
.wf-user-setting .form-warp { display: flex; flex-direction: row; width: 80%; height: 100%; margin: auto; padding-top: 10px; padding-bottom: 30px; align-items: center; align-items: space-between; }
.wf-user-setting .form-warp form { flex: 1 1 100%; }
.wf-user-setting .form-warp .avatar { position: relative; top: -16px; left: 10px; height: 100%; flex: 0 0 100px;display: flex; justify-content: center; align-items: center; }
.wf-user-setting .form-warp .avatar .ivu-avatar { width: 75px; height: 75px; border: 1px solid rgba(0, 0, 0, .2); }
.wf-user-setting .form-warp.small-screen .avatar { flex: 0 0 60px; }
.wf-user-setting .form-warp.small-screen .avatar .ivu-avatar { width: 60px; height: 60px; }
.wf-user-setting .form-itme-button button { margin: 0 10px; }
.wf-user-setting .ivu-tabs-tabpane { display: flex; flex-direction: column; }
.wf-user-setting .ivu-input-group-append .ivu-btn, .wf-user-setting .ivu-input-group-prepend .ivu-btn { margin: -7px; }
.wf-user-setting .align-for-profile { margin-right: -100px; }
</style>
