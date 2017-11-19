<template>
  <div class="comment-user-modal">
    <img :src="selectedCommentUserInfo.photoURL">
    <div>
      <h3>{{selectedCommentUserInfo.displayName}}</h3>
      <p v-if="encodedIP">
        <span>IP:</span> {{encodedIP}}
      </p>
      <p v-if="!isAnonymousUser">
        <span>Email:</span> {{selectedCommentUserInfo.email}}
      </p>
    </div>
  </div>
</template>

<script>
import Bus from '../common/bus'
export default {
  name: 'wf-comment-userinfo-modal',
  data () {
    return {
      uid: null
    }
  },
  computed: {
    $config () {
      return this.$_wf.config
    },
    $i18next () {
      return this.$_wf.i18next
    },
    selectedCommentUserInfo: () => Bus.$data.selectedCommentUserInfo,
    encodedIP () {
      const ip = this.selectedCommentUserInfo.ip
      if (!ip || (ip.indexOf('unknown') !== -1)) { return this.$i18next.t('common.unknown_ip') }
      const lastDotIdx = ip.lastIndexOf('.')
      const lastSec = ip.slice(lastDotIdx + 1)
      return lastSec ? `***.**.**.${lastSec}` : this.$i18next.t('common.unknown_ip')
    },
    isAnonymousUser () {
      const { anonymousUserId } = this.$config
      return !this.selectedCommentUserInfo.uid || this.selectedCommentUserInfo.uid === anonymousUserId
    }
  }
}
</script>
