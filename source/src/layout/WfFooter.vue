<template>
  <footer>
    <a href="https://github.com/cheng-kang/wildfire" 
      target="blank">
      <img src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/add-button.svg">
      {{$t('text/add_wildfire_to_your_site')}}
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
footer {
  margin-top: 30px;
  height: 45px;
  border-top: 2px solid #d4d4d4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #656c7a;
  font-weight: 500;
}
a {
  display: flex;
  align-items: center;
  font-size: 12px;
}
img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}
</style>