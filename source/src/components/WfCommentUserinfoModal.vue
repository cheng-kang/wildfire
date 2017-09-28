<template>
  <div class="comment-user-modal">
    <img :src="selectedCommentUserInfo.photoURL">
    <div>
      <h3>{{selectedCommentUserInfo.displayName}}</h3>
      <p>
        <span>IP:</span> {{formattedIP}}
      </p>
      <p v-if="!isAnonymousUser">
        <span>Email:</span> {{selectedCommentUserInfo.email}}
      </p>
    </div>
  </div>
</template>

<script>
import Bus from '../bus'
export default {
  name: 'wf-comment-userinfo-modal',
  data () {
    return {
      uid: null
    }
  },
  computed: {
    selectedCommentUserInfo: () => Bus.$data.selectedCommentUserInfo,
    formattedIP () {
      const ip = this.selectedCommentUserInfo.ip
      const lastDotIdx = ip.lastIndexOf('.')
      const lastSec = ip.slice(lastDotIdx + 1)
      return `***.**.**.${lastSec}`
    },
    isAnonymousUser () {
      return this.selectedCommentUserInfo.uid.indexOf(this.$config.anonymousUserIdPrefix) !== -1
    }
  }
}
</script>

<style scoped>
.comment-user-modal {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.comment-user-modal > img {
  width: 60px;
  height: 60px;
  margin-right: 30px;
}
.comment-user-modal > div > h3 {
  margin-bottom: 10px;
}
.comment-user-modal > div > p > span {
  margin-right: 12px;
}
</style>
