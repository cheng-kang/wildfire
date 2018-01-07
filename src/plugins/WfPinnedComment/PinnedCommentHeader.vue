<template>
  <transition name="fade">
    <div v-if="pinnedCommentId" class="pinned-comment-header" :style="{backgroundColor}">
      <span>{{i18next.t('WfPinnedComment.pinned_comment')}}</span>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Capa_1' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cpolygon style='fill:%23D6112E;' points='456.001,155.25 434.148,133.397 266.604,300.94 309.401,343.736 '/%3E%3Cpolygon style='fill:%23FF0F3B;' points='356.75,56 168.264,202.6 287.548,321.883 434.148,133.397 '/%3E%3Cpolygon style='fill:%23808080;' points='227.905,313.233 198.768,284.095 147.777,335.086 140.492,371.508 176.915,364.224 '/%3E%3Cpolygon style='fill:%239F9F9F;' points='147.777,335.086 0.001,482.862 0.001,512 29.138,512 176.915,364.224 '/%3E%3Cpath style='fill:%23FF0F3B;' d='M318.962,331.444l-21.853-21.853v131.12l21.853,21.853 C355.02,426.506,355.02,367.502,318.962,331.444z'/%3E%3Cpath style='fill:%23FF4D6B;' d='M297.109,309.59L180.556,193.038c-36.058-36.058-95.062-36.058-131.12,0l247.673,247.673 C333.166,404.653,333.166,345.648,297.109,309.59z'/%3E%3Cpath style='fill:%23FF0F3B;' d='M490.147,167.543H446.44l21.853,21.853c12.019,12.019,31.687,12.019,43.706,0L490.147,167.543z'/%3E%3Cpath style='fill:%23FF4D6B;' d='M490.147,167.543L322.604,0c-12.019,12.019-12.019,31.687,0,43.706L446.44,167.543 C458.46,179.563,478.128,179.563,490.147,167.543z'/%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E">
    </div>
  </transition>
</template>
<script>
export default {
  name: 'pinned-comment-header',
  props: ['bus'],
  data () {
    return {
      pinnedCommentId: null
    }
  },
  computed: {
    i18next () { return this.bus.i18next },
    backgroundColor () { return this.bus.pluginOptions.WfPinnedComment.backgroundColor || 'rgba(0, 0, 0, 0.03)' }
  },
  created () {
    this.bus.listenTo('WfPinnedComment.pinnedCommentId', pinnedCommentId => {
      this.pinnedCommentId = pinnedCommentId
    }, this._uid)
  },
  beforeDestroy () {
    this.bus.enough('WfPinnedComment.pinnedCommentId', null, this._uid)
  }
}
</script>
<style scoped>
.pinned-comment-header { display: flex; justify-content: flex-end; padding: 4px 0 0 0; height: 22px; width: 100%; color: #9ea7b4; font-size: 14px; font-weight: 500; }
.pinned-comment-header span { margin-right: 8px; }
.pinned-comment-header img { width: 18px; height: 18px; }
.fade-enter-active, .fade-leave-active { transition: opacity .5s }
.fade-enter { opacity: 0 }
.fade-enter-to { opacity: 1 }
</style>
