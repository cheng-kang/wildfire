<template>
  <div class="wf-tip">
    {{$i18next.t('common.tip_prefix')}}<slot></slot>
  </div>
</template>
<script>
export default {
  name: 'wf-tip',
  computed: {
    $i18next () {
      return this.$_wf.i18next
    }
  }
}
</script>
<style>
.wf-tip { padding: 0 16px 8px 16px; font-size: 0.7em; color: #656c7a; text-align: left; }
</style>
