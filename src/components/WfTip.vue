<template>
  <div class="wf-tip">
    {{i18next.t('common.tip_prefix')}}<slot></slot>
  </div>
</template>
<script>
import Bus from '../common/bus'
export default {
  name: 'wf-tip',
  computed: {
    i18next: () => Bus.i18next
  }
}
</script>
