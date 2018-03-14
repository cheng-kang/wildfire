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

<style>
.wf .wf-separator {
  width: 100%;
  height: 18px;
  font-weight: 500;
  margin: 24px 0 8px;
  position: relative;
}
.wf .wf-separator::before {
  content: "";
  display: block;
  width: 100%;
  height: 1px;
  background: #eee;
  position: absolute;
  top: 8px;
  left: 0;
}
.wf .wf-separator > span {
  display: inline-block;
  background: #fff;
  padding: 0 8px 0 8px;
  position: relative;
  margin-left: 16px;
  font-size: 12px;
}
</style>
