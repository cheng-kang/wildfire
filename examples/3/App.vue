<template>
  <div class="wildfire-dev-server">
    <wildfire :key="resetKey"></wildfire>
  </div>
</template>
<script>
import Vue from 'vue'
import wildfire from '../../src/aio'
export default {
  name: 'app',
  data () {
    return {
      resetKey: 0
    }
  },
  mounted () {
    window.$_wildfire_reset = (config) => {
      wildfire.reset(Vue, {
        pageURL: 'http://wildfire.js.org/dev-reset',
        pageTitle: 'Reset!!!',
        locale: 'en'
      })
      this.resetKey += 1
    }
  }
}
</script>
<style>
.wildfire-dev-server {
  max-width: 560px;
  margin: 0 auto;
}
</style>