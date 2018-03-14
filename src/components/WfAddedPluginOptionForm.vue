<template>
  <div class="wf-added-plugin-option-form">
    <i-form v-if="form" :model="form" :rules="rules" label-position="top">
      <i-form-item v-for="option in options" :key="option.key" :label="option.displayName" :prop="option.key">
        <i-input v-model="form[option.key]" :placeholder="option.placeholder"></i-input>
      </i-form-item>
      <div>
        <i-button type="primary" @click="submit">Submit</i-button>
        <i-button type="ghost" @click="reset" style="margin-left: 8px">Reset</i-button>
      </div>
    </i-form>
  </div>
</template>
<script>
import Bus from '../common/bus';

export default {
  name: 'wf-added-plugin-option-form',
  props: ['options', 'pluginId'],
  data() {
    return {
      form: undefined,
      rules: undefined,
    };
  },
  computed: {
    db: () => Bus.db,
  },
  created() {
    this.db.ref(`plugins/${this.pluginId}/a/x/x/x/u/options`).once('value')
      .then(snapshot => {
        const form = {};
        const rules = {};
        this.options.forEach(({ key, validate }) => {
          form[key] = '';
          rules[key] = validate;
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
    submit: () => {
      console.log('submit');
    },
    reset: () => {
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, key, '');
      });
    },
  },
};
</script>
