<template >
  <div class="wf-marked-content" ref="markedContent"></div>
</template>

<script>
import Vue from 'vue';
import '../assets/highlight.css';
import '../assets/highlight.dark.css';
import { markdown } from '../utils';
import { bus } from '../common';

export default {
  name: 'wf-marked-content',
  props: ['content'],
  mounted() {
    this.compile();
  },
  methods: {
    compile() {
      const html = markdown(this.content);
      const Component = Vue.extend({
        template: `<div> ${html} </div>`,
        methods: {
          showUserInfo(email) {
            bus.$emit('ShowUserInfo', email);
          },
        },
      });
      const markedComponent = new Component().$mount();
      this.$refs.markedContent.appendChild(markedComponent.$el);
    },
  },
};
</script>
