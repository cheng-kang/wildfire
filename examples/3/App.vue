<template>
  <div class="wildfire-dev-server">
    <wildfire :key="resetKey"></wildfire>
  </div>
</template>
<script>
import Vue from 'vue'
import wildfire from '../../src/main'

export default {
  name: 'app',
  data () {
    return {
      resetKey: 0
    }
  },
  mounted () {
    window.$_wildfire_reset = (config = {}, err) => {
      wildfire.reset(Vue, config, err)
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