<template>
  <i-form :model="form" :label-width="60" :class="{ 'wf-reply': isReply }">
    <i-form-item class="no-bottom-margin">
      <img :src="avatarURL" slot="label" :class="{ anonymous: user === null }">
      <i-input
        v-model="form.content"
        type="textarea"
        @on-click="postComment"
        @on-change="contentOnChange"
        :autosize="textareaAutoresize"
        :placeholder="placeholder"
        :disabled="shouldDisableInput"></i-input>
    </i-form-item>
    <section class="top-reply-area" v-if="isMain">
      <div>
        <i-switch size="small" @on-change="switchMentioning" :disabled="shouldDisableSwitch">
          <span slot="open">{{$i18next.t('switch/on')}}</span>
          <span slot="close">{{$i18next.t('switch/off')}}</span>
        </i-switch>
        <span :style="{ color: shouldDisableSwitchText ? '#bbbec4' : '#495060' }">
          {{$i18next.t('text/enableMentioning')}}{{isLoadingUserData ? (' - ' + $i18next.t('text/loadingUserData')) : ''}}
        </span>
      </div>
      <i-form-item>
          <i-button :type="isPosting ? 'ghost' : 'primary'" 
            @click="postComment" 
            :disabled="shouldDisableButton"
            :loading="isPosting">
            {{$i18next.t(isPosting ? 'button/posting' : 'button/post')}}
          </i-button>
          <i-button type="ghost" 
            style="margin-left: 8px" 
            :disabled="shouldDisableButton"
            @click="form.content = ''">
            {{$i18next.t('button/reset')}}
          </i-button>
      </i-form-item>
      <i-modal
        v-model="shouldShowAutoComplete"
        width="330"
        style="text-align: center;"
        :closable="false"
        :footer-hide="true">
        <i-auto-complete
          v-model="mentioningUsername"
          :autofocus="true"
          icon="ios-search"
          placeholder="input here"
          style="width:300px"
          @on-select="autoCompleteOnSelect">
          <i-option v-for="user in mentioningUserAutoComplete" :value="JSON.stringify(user)" :key="user.id">
            <div class="mentioning-option">
              <img :src="user.photoURL">
              <span>{{ user.displayName }}</span>
            </div>
          </i-option>
        </i-auto-complete>
      </i-modal>
    </section>

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

    <i-form-item class="float-to-right" v-else>
      <i-button type="text"
        :disabled="shouldDisableButton"
        @click="form.content = ''">
        {{$i18next.t('button/reset')}}
      </i-button>
      
      <i-button :type="isPosting ? 'ghost' : 'primary'"
        style="margin-left: 8px"
        @click="postComment"
        :disabled="shouldDisableButton"
        :loading="isPosting">
        {{$i18next.t(isPosting ? 'button/posting' : 'button/post')}}
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
    'rootCommentRepliesCount',
    'isMain'
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
      },
      isMentioningEnabled: false,
      isSettingUpMentioning: false,
      users: [],
      isLoadingUserData: false,
      mentioningUsername: '',
      atPosition: null,
      shouldShowAutoComplete: false
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
    },
    mentioningUserAutoComplete () {
      if (!this.mentioningUsername) { return [] }
      return this.users.filter(user => {
        return user.displayName.toLowerCase().indexOf(this.mentioningUsername.toLowerCase()) !== -1
      })
    },
    shouldDisableInput () {
      return this.isPosting || this.commentsLoadingState === 'loading'
    },
    shouldDisableButton () {
      return this.form.content.trim() === '' || this.isPosting
    },
    shouldDisableSwitch () {
      return this.shouldDisableInput || this.isLoadingUserData
    },
    shouldDisableSwitchText () {
      return !this.isMentioningEnabled || this.shouldDisableSwitch
    }
  },
  methods: {
    postComment () {
      if (this.isPosting) { return }

      this.isPosting = true
      const { content } = this.form
      const { user, isReply, encodedPageURL, rootComment, replyToComment } = this
      const { anonymousUserId } = this.$config

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
        const emptyRef = this.$database.ref(`/pages/${encodedPageURL}`).push()
        const newKey = this.$config.database === 'firebase' ? emptyRef.key : emptyRef.key()

        if (rootComment) {
          updates[`/pages/${encodedPageURL}/replies/${rootComment['.key']}/${newKey}`] = postData
          updates[`/pages/${encodedPageURL}/comments/${rootComment['.key']}/repliesCount`] = this.newRepliesCount
        } else if (isReply) {
          updates[`/pages/${encodedPageURL}/replies/${replyToComment['.key']}/${newKey}`] = postData
          updates[`/pages/${encodedPageURL}/comments/${replyToComment['.key']}/repliesCount`] = this.newRepliesCount
        } else {
          updates[`/pages/${encodedPageURL}/comments/${newKey}`] = Object.assign({}, postData, {repliesCount: 0})
          updates[`/pages/${encodedPageURL}/commentsCount`] = this.newCommentsCount
        }
        // console.log(updates)

        this.$database.ref().update(updates)
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
    },
    switchMentioning (newValue) {
      this.isMentioningEnabled = newValue
      if (newValue) {
        this.isLoadingUserData = true
        this.$database.ref('/users').once('value').then(snapshot => {
          const result = snapshot.val() || {}
          console.log(snapshot)
          console.log(snapshot.val())
          this.users = Object.keys(result).map(id => {
            const { displayName, photoURL, email } = result[id]
            return {
              id,
              displayName,
              photoURL,
              email
            }
          })
          this.isLoadingUserData = false
        })
      }
    },
    contentOnChange (e) {
      console.log(e.data === '@' && this.isMentioningEnabled)
      if (e.data === '@' && this.isMentioningEnabled) {
        this.atPosition = e.target.selectionStart
        this.mentioningUsername = ''
        this.shouldShowAutoComplete = true
      }
    },
    autoCompleteOnSelect (value) {
      this.shouldShowAutoComplete = false
      let user = JSON.parse(value)
      const formattedMentionText = `[@${user.displayName}](${user.email}) `
      const content = this.form.content
      // replace the '@' symbol with formatted text
      this.form.content = [content.slice(0, this.atPosition - 1), formattedMentionText, content.slice(this.atPosition)].join('')
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
.mentioning-option {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.mentioning-option img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
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

.top-reply-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.top-reply-area div {
  font-size: 10px;
  margin-left: 60px;
  align-self: flex-start;
}
.ivu-switch-checked .ivu-switch-inner {
  left: 4px;
  font-size: 8px;
}
.ivu-switch-inner {
  left: 12.5px;
  font-size: 8px;
}
</style>
