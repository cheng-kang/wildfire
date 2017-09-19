<template>
  <i-form :model="form" :label-width="60" :class="{ 'wf-reply': isReply }">
    <i-form-item class="no-bottom-margin">
      <img :src="avatarURL" slot="label">
      <i-input
        v-model="form.content"
        type="textarea"
        @on-click="postComment"
        :autosize="textareaAutoresize"
        :placeholder="placeholder"
        :disabled="isPosting || commentsLoadingState === 'loading'"></i-input>
    </i-form-item>

    <!-- <i-form-item class="editar-tools">
      <i-tooltip :content="editarTools.markdown.toolTipContent" placement="bottom" >
        <a @click="handleMarkdown" class="markdown" :class="{'tool-enabled':editarTools.markdown.isMarkdown }">
          <i-icon type="social-markdown"></i-icon>
        </a>
      </i-tooltip>

      <i-tooltip content="表情包" placement="bottom" >
        <a type="ghost" @click="handleEmoji" class="emoji">
          <i-icon type="android-happy"></i-icon>
        </a>
      </i-tooltip>
    </i-form-item> -->

    <i-form-item class="float-to-right">
      <i-button :type="isPosting ? 'ghost' : 'primary'"
        @click="postComment"
        :disabled="form.content.trim() === '' || isPosting"
        :loading="isPosting">
        {{$i18next.t(isPosting ? 'button/posting' : 'button/post')}}
      </i-button>
      <i-button type="ghost"
        style="margin-left: 8px"
        :disabled="form.content.trim() === '' || isPosting"
        @click="form.content = ''">
        {{$i18next.t('button/reset')}}
      </i-button>
    </i-form-item>

  </i-form>
</template>

<script>
export default {
  name: 'wf-reply-area',
  props: [
    'user',
    'replyToCommentAuthorUsername',
    'replyToComment',
    'rootComment',
    'commentsLoadingState',
    'pageCommentsCount',
    'rootCommentRepliesCount'
  ],
  data () {
    return {
      isPosting: false,
      form: {
        content: ''
      },
      // editarTools: {
      //   markdown: {
      //     isMarkdown: false,
      //     toolTipContent: this.$i18next.t('text/markdownDisabled')
      //   }
      // },
      textareaAutoresize: {
        minRows: 3,
        maxRows: 10
      }
    }
  },
  computed: {
    encodedPageURL () {
      return btoa(this.$config.pageURL)
    },
    avatarURL () {
      return this.user
        ? this.user.photoURL
        : this.$config.defaultAvatarURL
    },
    username () {
      return this.user.uid === this.$config.anonymousUserId
              ? this.$i18next.t('text/anonymousUser')
              : this.user.displayName
    },
    placeholder () {
      return this.isReply
      ? this.$i18next.t('textarea/replyToUserComment', { username: this.replyToCommentAuthorUsername })
      : (this.user
          ? this.$i18next.t('textarea/joinTheConversation')
          : this.$i18next.t('textarea/joinTheConversationAnonymously'))
    },
    isReply () {
      return !!this.replyToComment
    },
    newCommentsCount () {
      return (parseInt(this.pageCommentsCount) || 0) + 1
    },
    newRepliesCount () {
      return (parseInt(this.rootCommentRepliesCount) || 0) + 1
    }
  },
  methods: {
    postComment () {
      if (this.isPosting) { return }

      this.isPosting = true
      const { content } = this.form
      const { user, isReply, encodedPageURL, rootComment, replyToComment } = this
      const { siteId, anonymousUserId } = this.$config
      if (content.trim() !== '') {
        const aDate = new Date()
        const author = user ? user.displayName : this.$i18next.t('text/anonymousUser')
        const authorUid = user ? user.uid : anonymousUserId
        const date = aDate.toISOString()
        const order = isReply ? null : -1 * aDate.getTime()

        let replyToCommentId = null
        let updates = {}

        if (isReply) {
          replyToCommentId = replyToComment['.key']
        }

        const _this = this
        const postData = { author, authorUid, date, order, content, replyToCommentId }
        const emptyRef = this.$commentDB.ref(`/sites/${siteId}/${encodedPageURL}`).push()
        const newKey = emptyRef.key

        if (rootComment) {
          updates[`/sites/${siteId}/${encodedPageURL}/replies/${rootComment['.key']}/${newKey}`] = postData
          updates[`/sites/${siteId}/${encodedPageURL}/comments/${rootComment['.key']}/repliesCount`] = this.newRepliesCount
        } else if (isReply) {
          updates[`/sites/${siteId}/${encodedPageURL}/replies/${replyToComment['.key']}/${newKey}`] = postData
          updates[`/sites/${siteId}/${encodedPageURL}/comments/${replyToComment['.key']}/repliesCount`] = this.newRepliesCount
        } else {
          updates[`/sites/${siteId}/${encodedPageURL}/comments/${newKey}`] = { ...postData, repliesCount: 0 }
          updates[`/sites/${siteId}/${encodedPageURL}/commentsCount`] = this.newCommentsCount
        }

        this.$commentDB.ref().update(updates)
        .then(() => {
          _this.isPosting = false
          _this.$emit('finishedReplying') // When successfully post reply, hide the reply area
          _this.form.content = ''
          _this.$Message.success(_this.$i18next.t('text/commentPosted'))
        })
        .catch((error) => {
          _this.isPosting = false
          _this.form.content = ''
          _this.$Message.error(_this.$i18next.t('error/failedToPostComment'))
          console.log(error)
        })
      }
    }
    // handleMarkdown () {
    //   this.editarTools.markdown.isMarkdown = !this.editarTools.markdown.isMarkdown
    //   this.editarTools.markdown.toolTipContent = this.editarTools.markdown.isMarkdown ? this.$i18next.t('text/markdownEnabled') : this.$i18next.t('text/markdownDisabled')
    // },
    // handleEmoji () {}
  }
}
</script>

<style scoped>
img {
  width: 48px;
  height: 48px;
}
.wf-reply img {
  width: 36px;
  height: 36px;
}
.no-bottom-margin {
  /*margin-bottom: 0;*/
}
.float-to-right {
  text-align: right;
}
.ivu-form .ivu-form-item-label {
  padding: 0;
  text-align: left;
}
.ivu-form {
  margin-top: 10px;
}
.ivu-form-item {
  margin-bottom: 12px;
}
</style>
<style>
/*.editar-tools{
  margin: -10px auto -5px auto !important
}
.editar-tools .ivu-form-item-content{
  line-height: 20px !important;
}
.editar-tools .ivu-tooltip-rel{
  height: 20px;
  width: 20px
}
.editar-tools a{
  display: inline-block;
  border: 1px solid transparent;
  width: 20px;
  height: 16px;
  padding: 0;
  border-radius: 1px;
  line-height: 16px;
}
.editar-tools i{
  font-size: 20px;
  line-height: 14px !important;
  height: 13px;
}
.editar-tools .markdown{
  background: #888;
  color: #eee;
}
.editar-tools .emoji{
  color: #ff5722;
  background: #eee;
}
a.tool-enabled{
  border-color: #2d8cf0
}
a.tool-enabled i{
  background: #2d8cf0;
  color: #eee;
}*/
.ivu-spin {
  position: unset;
  background-color: unset;
}
.spin-icon {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from { transform: rotate(0deg);}
  50%  { transform: rotate(180deg);}
  to   { transform: rotate(360deg);}
}
/*.ivu-spin-show-text .ivu-spin-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ivu-spin-show-text .ivu-spin-text i {
  margin-right: 5px;
}*/
</style>
