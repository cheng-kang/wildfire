<template>
  <div class="wf-tip">
    {{t('common.tip_prefix')}}<slot></slot>
  </div>
</template>
<script>
import { butler } from '../common';

export default {
  name: 'wf-tip',
  computed: {
    t: () => (key) => butler.i18next.t(key),
  },
};
</script>
