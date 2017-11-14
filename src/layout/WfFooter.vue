<template>
  <footer>
    <a href="https://github.com/cheng-kang/wildfire"
      class="wf-use-wildfire"
      target="blank">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 294.774 294.774" xml:space="preserve"><path d="M251.63 43.179c-11.295-11.295-23.931-20.472-37.556-27.276 -2.966-1.482-6.568-0.277-8.048 2.687 -1.48 2.965-0.277 6.568 2.687 8.048 12.467 6.226 24.052 14.646 34.432 25.026 52.801 52.801 52.801 138.714 0 191.515s-138.714 52.801-191.515 0 -52.801-138.714 0-191.515C77.207 26.086 111.215 12 147.386 12c3.313 0 6-2.687 6-6s-2.687-6-6-6C108.009 0 70.989 15.334 43.144 43.179c-57.479 57.479-57.479 151.006 0 208.485 28.74 28.74 66.491 43.11 104.243 43.11s75.503-14.37 104.243-43.11C309.109 194.185 309.109 100.658 251.63 43.179zM147.387 51.992c-3.313 0-6 2.687-6 6v178.859c0 3.314 2.687 6 6 6s6-2.686 6-6V57.992C153.387 54.678 150.7 51.992 147.387 51.992zM171.387 153.421h65.43c3.313 0 6-2.687 6-6s-2.687-6-6-6h-65.43c-3.313 0-6 2.687-6 6S168.073 153.421 171.387 153.421zM57.957 141.421c-3.313 0-6 2.687-6 6s2.687 6 6 6h63.43c3.313 0 6-2.687 6-6s-2.687-6-6-6H57.957z" fill="#656c7a" /></svg>
      <span>{{$i18next.t('common.add_wildfire_to_your_site')}}</span>
    </a>
    <img
      class="wf-logo"
      src="http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/wildfire-logo.svg"
      title="Wildfire - Provided by Lahk">
  </footer>
</template>

<script>
export default {
  name: 'wf-footer',
  computed: {
    $i18next () {
      return this.$_wf.i18next
    }
  }
}
</script>

<style scoped>
footer { font-weight: 500; display: flex; height: 45px; margin-top: 30px; color: #656c7a; border-top: 2px solid #d4d4d4; justify-content: space-between; align-items: center; }
a { font-size: 12px; display: flex; align-items: center; }
.wf-use-wildfire svg, .wf-logo { width: 18px; height: 18px; margin-right: 10px; }
</style>