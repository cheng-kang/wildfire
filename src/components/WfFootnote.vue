<template>
  <div class="wf-footnote" v-if="!isClosed">
    {{this.prefix || t(`Footnote.prefix.${this.type}`)}}<slot></slot>
    <i-button type="text" icon="ios-close-empty" @click="isClosed = true"/>
  </div>
</template>
<script>
import { butler } from '../common';

export default {
  name: 'wf-footnote',
  props: ['type', 'prefix'],
  data() {
    return {
      isClosed: false,
    };
  },
  computed: {
    t: () => (keys, options) => butler.i18next.t(keys, options),
  },
};
</script>
