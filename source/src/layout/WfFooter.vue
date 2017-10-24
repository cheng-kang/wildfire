<template>
  <footer>
    <a href="https://github.com/cheng-kang/wildfire" 
      target="blank">
      <img src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/add-button.svg">
      {{$i18next.t('common.add_wildfire_to_your_site')}}
    </a>
    <img
      class="wf-logo"
      src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/wildfire-logo.svg"
      title="Wildfire - Provided by Lahk">
  </footer>
</template>

<script>
export default {
  name: 'wf-footer'
}
</script>

<style scoped>
footer { font-weight: 500; display: flex; height: 45px; margin-top: 30px; color: #656c7a; border-top: 2px solid #d4d4d4; justify-content: space-between; align-items: center; }
a { font-size: 12px; display: flex; align-items: center; }
img { width: 18px; height: 18px; margin-right: 10px; }
</style>