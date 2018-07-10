<template> 
  <i-tabs class="wf-user-setting">
    <i-tab-pane :label="t('UserSetting.tab.profile')" name="profile" :disabled="updatingAccount">
      <div class="wf-form-warp" :class="{ 'wf-is-small-screen': isSmallScreen }">
        <i-form ref="profileForm" :model="profileForm" :rules="rule" label-position="top">
          <i-form-item :label="t('UserSetting.label.display_name')" prop="displayName">
            <i-input type="text" v-model="profileForm.displayName" :placeholder="t('UserSetting.placeholder.display_name')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('UserSetting.label.photo_url')" prop="photoURL">
            <i-input type="text" v-model="profileForm.photoURL" :placeholder="t('UserSetting.placeholder.photo_url')">
              <i-button slot="append" icon="refresh" @click="resetAvatar"></i-button>
            </i-input>
          </i-form-item>
          <div class="wf-buttons wf-align-for-profile">
            <i-button 
            type="primary" 
            @click="handleChangeProfile()" 
            :disabled="updatingProfile || avatarTesting" 
            :loading="updatingProfile">
              {{ t('UserSetting.btn.update') }}
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="updatingProfile">
              {{ t('UserSetting.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
        <div class="wf-avatar" >
          <img :src="avatarTestURL" @error="avatarOnError">
        </div>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="t('UserSetting.tab.account')" name="account" :disabled="updatingProfile">
      <div class="wf-form-warp">
        <i-form ref="accountForm" :model="accountForm" :rules="rule" label-position="top">
          <i-form-item :label="t('UserSetting.label.old_pwd')" prop="oldPassword">
            <i-input type="password" v-model="accountForm.oldPassword" :placeholder="t('UserSetting.placeholder.old_pwd')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('UserSetting.label.new_pwd')" prop="newPassword">
            <i-input type="password" v-model="accountForm.newPassword" :placeholder="t('UserSetting.placeholder.new_pwd')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('UserSetting.label.confirm_pwd')" prop="passwordCheck">
            <i-input type="password" v-model="accountForm.passwordCheck" :placeholder="t('UserSetting.placeholder.confirm_pwd')">
            </i-input>
          </i-form-item>
          <div class="wf-buttons">
            <i-button
            type="primary" 
            @click="handleChangeAccount()" 
            :disabled="updatingAccount || passwordTesting" 
            :loading="updatingAccount">
              {{ t('UserSetting.btn.update') }} 
            </i-button>
            <i-button 
            type="text" 
            @click="closeModel()" 
            :disabled="updatingAccount">
              {{ t('UserSetting.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import { bus, butler } from '../common';
import { handleImageOnError } from '../utils';

export default {
  name: 'wf-user-setting',
  data() {
    const { user } = bus;
    const t = (key) => butler.i18next.t(key);
    const validateOldPassword = (rule, value, callback) => {
      this.passwordTesting = true;
      const credential = butler.authService(user.email, value);
      if (typeof (butler.auth.currentUser.reauthenticate) === 'function') {
        butler.auth.currentUser.reauthenticate(credential)
          .then(() => {
            this.passwordTesting = false;
            callback();
          })
          .catch(() => {
            this.passwordTesting = false;
            callback(new Error(t('UserSetting.error.password')));
          });
      } else if (typeof (butler.auth.currentUser.reauthenticateWithCredential) === 'function') {
        butler.auth.currentUser.reauthenticateWithCredential(credential)
          .then(() => {
            this.passwordTesting = false;
            callback();
          })
          .catch(() => {
            this.passwordTesting = false;
            callback(new Error(t('UserSetting.error.password')));
          });
      }
    };
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.accountForm.newPassword) {
        callback(new Error(t('UserSetting.error.passwords_dont_match')));
      } else {
        callback();
      }
    };
    const validatePhotoURL = (rule, value, callback) => {
      this.avatarTesting = true;
      const avatar = new Image();
      avatar.src = value;
      avatar.onload = () => {
        this.avatarTestURL = value;
        this.avatarTesting = false;
        callback();
      };
      avatar.onerror = () => {
        this.avatarTestURL = user.photoURL;
        this.avatarTesting = false;
        callback(new Error(t('UserSetting.error.invalid_photo_url')));
      };
    };
    const validateDisplayName = (rule, value, callback) => {
      callback();
    };
    return {
      avatarTesting: false,
      passwordTesting: false,
      updatingProfile: false,
      updatingAccount: false,
      avatarTestURL: user.photoURL,
      profileForm: {
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      accountForm: {
        oldPassword: '',
        newPassword: '',
        passwordCheck: '',
      },
      rule: {
        displayName: [
          { required: true, message: '', trigger: 'blur' },
          { validator: validateDisplayName, trigger: 'blur' },
        ],
        photoURL: [
          { required: true, message: '', trigger: 'blur' },
          { validator: validatePhotoURL, trigger: 'blur' },
        ],
        oldPassword: [
          { required: true, message: t('UserSetting.error.empty_old_pwd'), trigger: 'blur' },
          {
            type: 'string', min: 6, message: t('UserSetting.error.password_min_length'), trigger: 'blur',
          },
          { validator: validateOldPassword, trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: t('UserSetting.error.empty_new_pwd'), trigger: 'blur' },
          {
            type: 'string', min: 6, message: t('UserSetting.error.password_min_length'), trigger: 'blur',
          },
        ],
        passwordCheck: [
          { required: true, message: t('UserSetting.error.empty_confirm_pwd'), trigger: 'blur' },
          { validator: validatePasswordCheck, trigger: 'blur' },
        ],
      },
      shouldShowPassword: true,
    };
  },
  computed: {
    t: () => (keys, options) => butler.i18next.t(keys, options),
    user: () => bus.user,
    windowWidth: () => bus.windowWidth,
    isSmallScreen() {
      // <= screen width of iPhone 6 plus
      return this.windowWidth <= 414;
    },
  },
  methods: {
    avatarOnError(event) {
      handleImageOnError(
        event.target,
        this.config.defaultAvatarURL,
        this.t('CommentCard.html_title.image_onerror'),
      );
    },
    handleChangeProfile() {
      this.$refs.profileForm.validate((valid) => {
        if (valid) {
          // this.updatingProfile = true
          const { displayName, photoURL } = this.profileForm;
          const updates = {
            '/displayName': displayName,
            '/photoURL': photoURL,
          };
          butler.db.ref(`/users/${this.user.uid}`).update(updates)
            .then(() => {
              bus.user = Object.assign({}, bus.user, { displayName, photoURL });

              this.updatingProfile = false;
              this.$Message.info(this.t('UserSetting.success.updating_profile'));
            }).catch((error) => {
              this.updatingProfile = false;
              console.log(error.code, error.message);
              this.$Message.error(this.t('UserSetting.error.unknown'));
            });
        } else {
          this.$Message.error(this.t('UserSetting.error.invalid_form'));
        }
      });
    },
    handleChangeAccount() {
      this.$refs.accountForm.validate((valid) => {
        if (valid) {
          this.updatingAccount = true;
          const password = this.accountForm.newPassword;
          butler.auth.currentUser.updatePassword(password).then(() => {
            this.updatingAccount = false;
            this.$refs.accountForm.resetFields();
            this.$Message.info(this.t('UserSetting.success.changing_password'));
          }).catch((error) => {
            this.updatingAccount = false;
            console.log(error.code, error.message);
            this.$refs.accountForm.resetFields();
          });
        } else {
          this.$Message.error(this.t('UserSetting.error.invalid_form'));
        }
      });
    },
    resetAvatar() {
      this.profileForm.photoURL = this.user.photoURL;
      this.avatarTestURL = this.user.photoURL;
      this.$refs.profileForm.validateField('photoURL');
    },
    closeModel() {
      this.$refs.accountForm.resetFields();
      this.avatarTestURL = this.user.photoURL;
      this.$parent.close();
    },
  },
};
</script>
