<template>
  <div class="wf-form" :class="{ 'wf-reply': isReply }">
    <img class="wf-avatar" :src="!user ? 'http://7u2sl0.com1.z0.glb.clouddn.com/wildfire/firefighter-avatar.png' : user.photoURL">
    <div class="wf-textarea-wrapper">
      <span class="wf-textarea-placeholder" :class="{ inactive: !shouldShowPlaceholder }" @click="startEditing">
        {{$i18next.t('textarea/placeholder')}}
      </span>
      <div class="wf-textarea" :class="{ hasContent: !shouldShowPlaceholder || isReply }" :id="'wf-textarea-'+_uid" @blur="didEndEditing" contenteditable></div>
      <div class="wf-post-button-wrapper" :class="{ inactive: shouldShowPlaceholder && !isReply }">
        <button class="wf-post-button" @click="postComment">{{$i18next.t('button/post')}}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'wf-reply-area',
  props: ['user', 'replyToComment', 'rootComment'],
  data () {
    return {
      shouldShowPlaceholder: true,
      isReply: false
    }
  },
  computed: {
    textarea () {
      return document.getElementById(`wf-textarea-${this._uid}`)
    }
  },
  created () {
    this.isReply = !!this.replyToComment
  },
  methods: {
    startEditing () {
      this.textarea.focus()
      this.shouldShowPlaceholder = false
    },
    didEndEditing () {
      if (this.textarea.textContent === '') {
        this.shouldShowPlaceholder = true
      }
    },
    postComment () {
      const content = this.textarea.textContent
      this.textarea.textContent = ''
      const { siteId, pageURL } = window._wildfire.config
      if (content.trim() !== '') {
        const aDate = new Date()
        let author = this.user === null ? this.$i18next.t('text/anonymousUser') : this.user.displayName
        let authorUid = this.user === null ? 'anonymous' : this.user.uid
        let date = aDate.toISOString()
        let order = this.isReply ? null : -1 * aDate.getTime()
        let replyToId = null
        let replyToAuthor = null
        let refURL = ''
        if (this.isReply) {
          replyToId = this.replyToComment['.key']
          replyToAuthor = this.replyToComment.author
        }
        if (this.rootComment) {
          refURL = `/sites/${siteId}/${btoa(pageURL)}/comments/${this.rootComment['.key']}/replies`
        } else if (this.isReply) {
          refURL = `/sites/${siteId}/${btoa(pageURL)}/comments/${this.replyToComment['.key']}/replies`
        } else {
          refURL = `/sites/${siteId}/${btoa(pageURL)}/comments`
        }
        const postData = { author, authorUid, date, order, content, replyToId, replyToAuthor }
        this.$db.ref(refURL).push().set(postData)
        return
      }
    }
  }
}
</script>

<style scoped>
</style>