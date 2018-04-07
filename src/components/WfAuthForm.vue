<template>
  <i-tabs :value="initTab" class="wf-auth-form">
    <i-tab-pane :label="t('AuthForm.btn.sign_up')" name="sign_up" :disabled="loadingSignIn">
      <div class="wf-form-warp">
        <i-form ref="signUpForm" :model="signUpForm" :rules="rule" label-position="top">
          <i-form-item :label="t('AuthForm.label.email')" prop="email">
            <i-input type="text" v-model="signUpForm.email" :placeholder="t('AuthForm.placeholder.email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('AuthForm.label.password')" prop="password">
            <i-input type="password" v-model="signUpForm.password" :placeholder="t('AuthForm.placeholder.password')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('AuthForm.label.confirm_pwd')" prop="passwordCheck">
            <i-input type="password" v-model="signUpForm.passwordCheck" :placeholder="t('AuthForm.placeholder.confirm_pwd')">
            </i-input>
          </i-form-item>
          <div class="wf-buttons">
            <i-button
            type="primary"
            @click="handleSignUp('signUpForm')"
            :disabled="loadingSignUp"
            :loading="loadingSignUp">
              {{ t('AuthForm.btn.sign_up') }}
            </i-button>
            <i-button
            type="text"
            @click="closeModel()"
            :disabled="loadingSignUp">
              {{ t('AuthForm.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>

    <i-tab-pane :label="t('AuthForm.btn.sign_in')" name="sign_in" :disabled="loadingSignUp">
      <div class="wf-form-warp">
        <i-form ref="signInForm" :model="signInForm" :rules="rule" label-position="top">
          <i-form-item :label="t('AuthForm.label.email')" prop="email">
            <i-input type="text" v-model="signInForm.email" :placeholder="t('AuthForm.placeholder.email')">
            </i-input>
          </i-form-item>
          <i-form-item :label="t('AuthForm.label.password')" prop="password">
            <i-input type="password" v-model="signInForm.password" :placeholder="t('AuthForm.placeholder.password')">
            </i-input>
          </i-form-item>
          <div class="wf-buttons">
            <i-button
            type="primary"
            @click="handleSignIn('signInForm')"
            :disabled="loadingSignIn"
            :loading="loadingSignIn">
              {{ t('AuthForm.btn.sign_in') }}
            </i-button>
            <i-button
            type="text"
            @click="closeModel()"
            :disabled="loadingSignIn">
              {{ t('AuthForm.btn.cancel') }}
            </i-button>
          </div>
        </i-form>
      </div>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import { butler } from '../common';
import { PHM, handlePluginHookError, EVENTS } from '../plugin';
import { handleImageOnError } from '../utils';

export default {
  name: 'wf-auth-form',
  props: ['initTab'],
  data() {
    const t = (key) => butler.i18next.t(key);
    const validatePasswordCheck = (rule, value, callback) => {
      if (value !== this.signUpForm.password) {
        callback(new Error(t('AuthForm.error.passwords_dont_match')));
      } else {
        callback();
      }
    };
    return {
      showModal: true,
      loadingSignUp: false,
      loadingSignIn: false,
      signInForm: {
        email: 'admin@wildfire.js.org',
        password: '123456',
      },
      signUpForm: {
        email: '',
        password: '',
        passwordCheck: '',
      },
      rule: {
        email: [
          { required: true, message: t('AuthForm.error.empty_email'), trigger: 'blur' },
          { type: 'email', message: t('AuthForm.error.invalid_email'), trigger: 'blur' },
        ],
        password: [
          { required: true, message: t('AuthForm.error.empty_pwd'), trigger: 'blur' },
          {
            type: 'string', min: 6, message: t('AuthForm.error.password_min_length'), trigger: 'blur',
          },
        ],
        passwordCheck: [
          { required: true, message: t('AuthForm.error.empty_confirm_pwd'), trigger: 'blur' },
          { validator: validatePasswordCheck, trigger: 'blur' },
        ],
      },
      shouldShowPassword: true,
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
  },
  methods: {
    handleSignIn(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const { email, password } = this.signInForm;
          this.loadingSignIn = true;

          PHM.beforeEvent(EVENTS.SIGN_IN, { email })
            .then(() => {
              butler.auth.signInWithEmailAndPassword(email, password)
                .then((user) => {
                  butler.db.ref(`users/${user.uid}`).once('value').then(() => {
                    this.loadingSignIn = false;
                    this.closeModel();
                    this.$Message.info(this.t('AuthForm.success.signing_in'));

                    PHM.afterEvent(EVENTS.SIGN_IN, { user });
                  });
                }).catch((error) => {
                  this.loadingSignIn = false;
                  this.$Message.error(this.t('AuthForm.error.signing_in'));

                  PHM.afterEvent(EVENTS.SIGN_IN, { error, email });
                });
            })
            .catch((error) => {
              this.loadingSignIn = false;
              handleImageOnError(error);
              handlePluginHookError(error);
            })
        } else {
          this.$Message.error(this.t('AuthForm.error.invalid_form'));
        }
      });
    },
    handleSignUp(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const { email, password } = this.signUpForm;
          const displayName = email.split('@')[0];
          const photoURL = butler.config.defaultAvatarURL;
          this.loadingSignUp = true;
          
          PHM.beforeEvent(EVENTS.SIGN_UP, { email })
            .then(() => {
              butler.auth.createUserWithEmailAndPassword(email, password)
                .then((user) => {
                  const updates = {};
                  updates['/displayName'] = displayName;
                  updates['/email'] = email;
                  updates['/photoURL'] = photoURL;
                  updates['/regDate'] = (new Date()).toISOString();

                  butler.db.ref(`/users/${user.uid}`).update(updates)
                    .then(() => {
                      this.loadingSignUp = false;
                      this.closeModel();
                      this.$Message.info(this.t('AuthForm.success.signing_up'));

                      PHM.afterEvent(EVENTS.SIGN_UP, { email });

                    }).catch(error => {
                      this.loadingSignUp = false;
                      this.$Message.error(this.t('AuthForm.error.unknown'));

                      PHM.afterEvent(EVENTS.SIGN_UP, { error, email });
                    });
                }).catch((error) => {
                  this.loadingSignUp = false;
                  const { code: errorCode } = error;
                  let { message: errorMessage } = error;
                  switch (errorCode) {
                    case 'auth/email-already-in-use':
                      errorMessage = this.t('AuthForm.error.email_already_in_use');
                      break;
                    case 'auth/operation-not-allowed':
                      errorMessage = this.t('AuthForm.error.operation_not_allowed');
                      break;
                    case 'auth/weak-password':
                      errorMessage = this.t('AuthForm.error.weak_password');
                      break;
                    default:
                      errorMessage = this.t('AuthForm.error.unknown');
                      break;
                  }
                  this.$Message.error(errorMessage);

                  PHM.afterEvent(EVENTS.SIGN_UP, { error, email });
                });
            })
            .catch((error) => {
              this.loadingSignUp = false;
              handlePluginHookError(error);
            })
        } else {
          this.$Message.error(this.t('AuthForm.error.invalid_form'));
        }
      });
    },
    closeModel() {
      this.$refs.signInForm.resetFields();
      this.$refs.signUpForm.resetFields();
      this.$parent.close();
    },
  },
};
</script>
