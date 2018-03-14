<template>
  <div class="wf-added-plugin-option-form">
    <i-form v-if="form" ref="form" :model="form" :rules="rules" label-position="top">
      <i-form-item v-for="option in options" :key="option.key" :label="t(option.displayName)" :prop="option.key">
        <i-input v-model="form[option.key]" :placeholder="t(option.placeholder)"></i-input>
      </i-form-item>
      <div>
        <i-button type="primary" @click="submit" :loading="isUpdating">Submit</i-button>
        <i-button type="ghost" @click="reset" style="margin-left: 8px">Reset</i-button>
      </div>
    </i-form>
  </div>
</template>
<script>
import Bus from '../common/bus';
import { PTM } from '../utils';

export default {
  name: 'wf-added-plugin-option-form',
  props: ['options', 'pluginId'],
  data() {
    return {
      form: undefined,
      rules: undefined,
      isUpdating: false,
      t: PTM.t(Bus.config.locale)(this.pluginId),
    };
  },
  computed: {
    optionRef: () => Bus.db.ref(`plugins/${this.pluginId}/a/x/x/x/u/options`),
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
              ? Object.assign(rule, { message: this.t(rule.message) })
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
      .catch(error => {
        console.error(error);
        this.$Message.error('AddedPluginOptionForm.error.loading_option');
      });
  },
  methods: {
    submit() {
      this.isUpdating = true;
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.optionRef.update(this.form)
            .then(() => {
              this.$Message.success('AddedPluginOptionForm.success.update');
            })
            .catch(error => {
              console.error(error);
              this.$Message.error('AddedPluginOptionForm.error.update');
            })
            .finally(() => {
              this.isUpdating = false;
            });
        } else {
          this.isUpdating = false;
          this.$Message.error('AddedPluginOptionForm.error.invalid_form');
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
