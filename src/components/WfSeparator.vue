<template>
  <div class="wf-separator" :style="wrapperStyle">
    <span v-if="title">{{title}}</span>
  </div>
</template>

<script>
export default {
  name: 'wf-separator',
  props: ['title', 'marginTop'],
  computed: {
    wrapperStyle() {
      return {
        marginTop: this.marginTop || '24px',
      };
    },
  },
};
</script>
