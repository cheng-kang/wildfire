<template>
  <div class="wf-user-info-modal">
    <img
      :src="selectedCommentUserInfo.photoURL"
      :class="{ 'wf-anonymous': isAnonymousUser }"
      @error="avatarOnError">
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
import { bus, butler } from '../common';
import { handleImageOnError } from '../utils';

export default {
  name: 'wf-user-info-modal',
  data() {
    return {
      uid: null,
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
    selectedCommentUserInfo: () => bus.selectedCommentUserInfo,
    encodedIP() {
      const { ip } = this.selectedCommentUserInfo;
      if (!ip || (ip.indexOf('unknown') !== -1)) { return this.t('common.unknown_ip'); }
      const lastDotIdx = ip.lastIndexOf('.');
      const lastSec = ip.slice(lastDotIdx + 1);
      return lastSec ? `***.**.**.${lastSec}` : this.t('common.unknown_ip');
    },
    isAnonymousUser() {
      const { anonymousUserId } = butler.config;
      return (
        !this.selectedCommentUserInfo.uid
        || this.selectedCommentUserInfo.uid === anonymousUserId
      );
    },
  },
  methods: {
    avatarOnError(event) {
      handleImageOnError(
        event.target,
        butler.config.defaultAvatarURL,
        this.t('CommentCard.html_title.image_onerror'),
      );
    },
  },
};
</script>
