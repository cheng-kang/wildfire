<template>
  <div class="wf-tip">
    {{$i18next.t('common.tip_prefix')}}<slot></slot>
  </div>
</template>
<script>
export default {
  name: 'wf-tip'
}
</script>
<style scoped>
.wf-tip {
  padding: 0 16px 8px 16px;
  font-size: 0.7em;
  color: #656c7a;
  text-align: left;
}
</style>