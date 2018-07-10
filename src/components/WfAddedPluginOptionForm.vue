<template>
  <div class="wf-added-plugin-option-form">
    <i-form v-if="form" ref="form" :model="form" :rules="rules" label-position="top">
      <i-form-item v-for="option in options" :key="option.key" :label="_t(option.displayName)" :prop="option.key">
        <i-input v-model="form[option.key]" :placeholder="_t(option.placeholder)"></i-input>
      </i-form-item>
      <div>
        <i-button type="primary" @click="submit" :loading="isUpdating">Submit</i-button>
        <i-button type="ghost" @click="reset" style="margin-left: 8px">Reset</i-button>
      </div>
    </i-form>
  </div>
</template>
<script>
import { butler } from '../common';

export default {
  name: 'wf-added-plugin-option-form',
  props: ['options', 'pluginId', 't'],
  data() {
    return {
      form: undefined,
      rules: undefined,
      isUpdating: false,
    };
  },
  computed: {
    optionRef() {
      return butler.db.ref(`plugins/${this.pluginId}/a/x/x/x/u/options`);
    },
    _t() {
      return this.t(this.pluginId);
    },
    __t: () => (keys, options) => butler.i18next.t(keys, options),
  },
  created() {
    this.optionRef.once('value')
      .then(snapshot => {
        const form = {};
        const rules = {};
        this.options.forEach(({ key, validate }) => {
          form[key] = '';
          rules[key] = validate.map(rule => (
            rule.message
              ? Object.assign(rule, { message: this._t(rule.message) })
              : rule
          ));
        });
        const options = snapshot.val();
        if (options) {
          Object.keys(options).forEach((key) => { form[key] = options[key]; });
        }
        this.form = form;
        this.rules = rules;
      })
      .catch(() => {
        this.$Message.error(this.__t('AddedPluginOptionForm.error.loading_option'));
      });
  },
  methods: {
    submit() {
      this.isUpdating = true;
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.optionRef.update(this.form)
            .then(() => {
              this.$Message.success(this.__t('AddedPluginOptionForm.success.update'));
            })
            .catch(() => {
              this.$Message.error(this.__t('AddedPluginOptionForm.error.update'));
            })
            .finally(() => {
              this.isUpdating = false;
            });
        } else {
          this.isUpdating = false;
          this.$Message.error(this.__t('AddedPluginOptionForm.error.invalid_form'));
        }
      });
    },
    reset() {
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, key, '');
      });
    },
  },
};
</script>
