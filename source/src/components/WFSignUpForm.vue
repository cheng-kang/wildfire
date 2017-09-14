<template>    
  <i-form ref="authForm" :model="authForm" :rules="rule" :label-width="80">
    <i-form-item :label="$i18next.t('text/email')" prop="email">
      <i-input type="text" v-model="authForm.email" :placeholder="$i18next.t('text/email')">
      </i-input>
    </i-form-item>
    <i-form-item :label="$i18next.t('text/password')" prop="password">
      <i-input type="password" v-model="authForm.password" :placeholder="$i18next.t('text/password')">
      </i-input>
    </i-form-item>
    <i-form-item :label="$i18next.t('text/confirm')" prop="passwordCheck">
      <i-input type="password" v-model="authForm.passwordCheck" :placeholder="$i18next.t('text/reEnterPassword')">
      </i-input>
    </i-form-item>
  </i-form>
</template>

<script>
export default {
  name: 'wf-sign-up-form',
  data () {
    const _this = this
    const validatePasswordCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(_this.$i18next.t('error/pleaseReEnterPassword')))
      } else if (value !== this.authForm.password) {
        callback(new Error(_this.$i18next.t('error/twoPasswordsDontMatch')))
      } else {
        callback()
      }
    }
    return {
      authForm: {
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
          { validator: validatePasswordCheck, trigger: 'blur' }
        ]
      },
      shouldShowPassword: true
    }
  },
  methods: {
    handleSubmit () {
      //
    }
  }
}
</script>

<style scoped>
</style>