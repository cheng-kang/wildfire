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
      <div class="tool-bar">
        <span style="color: #bbbec4">
          {{isLoadingUserData 
              ? $i18next.t('text/initializingMentionAutocomplete') 
              : $i18next.t('text/initializedMentionAutocomplete')}}
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
            <div class="mention-option">
              <img :src="user.photoURL">
              <span>{{ user.displayName }}</span>
              <span>{{ user.email }}</span>
            </div>
          </i-option>
        </i-auto-complete>
      </i-modal>
    </section>

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
      textareaAutoresize: {
        minRows: 3,
        maxRows: 10
      },
      users: [],
      isLoadingUserData: true,
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
      return this.user
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
    isMentionEnabled () {
      return !this.isLoadingUserData
    }
  },
  created () {
    this.initMentionAutocomplete()
  },
  methods: {
    postComment () {
      if (this.isPosting) { return }

      this.isPosting = true
      const { content } = this.form
      const { user, users, isReply, encodedPageURL, rootComment, replyToComment } = this
      const { anonymousUserIdPrefix } = this.$config

      if (content.trim() !== '') {
        const aDate = new Date()
        const ip = this.$ip
        const authorUid = user ? user.uid : (anonymousUserIdPrefix + ip)
        const date = aDate.toISOString()
        const order = -1 * aDate.getTime()

        let replyToCommentId = null
        let updates = {}

        if (isReply) {
          replyToCommentId = replyToComment['.key']
        }
        const postData = { authorUid, date, order, content, replyToCommentId, ip }
        const emptyRef = this.$database.ref(`/pages/${encodedPageURL}`).push()
        // Note:
        // firebase: ref.key
        // wilddog: ref.key()
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

        this.$database.ref().update(updates)
        .then(() => {
          this.isPosting = false
          this.$emit('finishedReplying') // When successfully posted reply, hide current reply area
          this.form.content = ''
          this.$Message.success(this.$i18next.t('text/commentPosted'))

          const mentions = content.match(new RegExp('\\[@([^\\[\\]]+)\\]\\([^\\(\\)]+\\)', 'g')) || []
          if (users.length !== 0) {
            mentions.forEach(mention => {
              const email = mention.slice(mention.indexOf('(') + 1, -1)
              const mentionedUid = this.users.find(user => {
                return user.email === email
              }).id

              this.$database.ref(`/mention/${mentionedUid}`).push({
                date,
                order,
                page: encodedPageURL,
                commentId: isReply ? null : newKey,
                replyId: isReply ? newKey : null,
                isRead: false
              })
            })
          } else {
            mentions.forEach(mention => {
              const email = mention.slice(mention.indexOf('(') + 1, -1)
              this.$database.ref(`users`).orderByChild('email').equalTo(email).once('value').then((snapshot) => {
                let res = snapshot.val()
                if (res) {
                  const mentionedUid = Object.keys(res)[0]
                  this.$database.ref(`/mention/${mentionedUid}`).push({
                    date,
                    order,
                    page: encodedPageURL,
                    commentId: isReply ? null : newKey,
                    replyId: isReply ? newKey : null,
                    isRead: false
                  })
                }
              })
            })
          }
        })
        .catch((error) => {
          this.isPosting = false
          this.form.content = ''
          this.$Message.error(this.$i18next.t('error/failedToPostComment'))
          console.log(error)
        })
      }
    },
    initMentionAutocomplete () {
      this.$database.ref('/users').once('value').then(snapshot => {
        const result = snapshot.val() || {}
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
    },
    contentOnChange (e) {
      if (e.data === '@' && this.isMentionEnabled) {
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
.mention-option {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.mention-option img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}
.mention-option span:nth-of-type(1) {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mention-option span:nth-of-type(2) {
  margin-left: 20px;
  font-style: italic;
}
</style>
<style>
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
.top-reply-area {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.top-reply-area div {
  font-size: 10px;
  margin-left: 60px;
  display: flex;
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
