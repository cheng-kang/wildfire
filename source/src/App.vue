<template>
  <div class="wldfire-website">
    <wildfire></wildfire>
  </div>
</template>

<script>
import Wildfire from './Wildfire'
export default {
  name: 'wildfire-website',
  components: {
    Wildfire
  },
  data () {
    return {
    }
  },
  mounted () {
    if (this.$config.theme === 'dark') {
      document.body.className = 'dark'
    }
  }
}
</script>
