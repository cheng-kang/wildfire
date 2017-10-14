<template>
  <i-form :model="form"
    :label-width="60"
    :class="{ 'wf-reply': isReply }">
    <i-form-item class="no-bottom-margin">
      <img slot="label" :src="avatarURL" :class="{ anonymous: user === null }">
      <i-input
        v-model="form.content"
        type="textarea"
        @on-click="postComment"
        @on-change="contentOnChange"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :placeholder="placeholder"
        :disabled="shouldDisableInput"></i-input>
    </i-form-item>
    <section class="top-reply-area" v-if="isMain">
      <div class="tool-bar">
        <span style="color: #bbbec4">
          {{isLoadingUserData
              ? $i18next.t('text/initializingMentionAutocomplete')
              : (this.user
                  ? $i18next.t('text/initializedMentionAutocomplete')
                  : $i18next.t('error/mentionFuncNotAuthorized'))}}
        </span>
      </div>
      <div>
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
      </div>
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
import Bus from '../bus'
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
      users: [],
      /*
        Mention
       */
      mentioningUsername: '',
      atPosition: null,
      shouldShowAutoComplete: false
      /*
        End of: Mention
       */
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
    shouldDisableInput () {
      return this.isPosting || this.commentsLoadingState === 'loading'
    },
    shouldDisableButton () {
      return this.form.content.trim() === '' || this.isPosting
    },
    isLoadingUserData () {
      return Bus.$data.isLoadingUserData
    },
    isMentionEnabled () {
      return !this.isLoadingUserData
    }
  },
  created () {
    /*
      `MentionAutoCompleteSelected` event observer
      Note: update current reply area when recieves the event.
     */
    Bus.$on(`MentionAutoCompleteSelected-${this._uid}`, formattedMentionText => {
      const content = this.form.content
      // replace the '@' symbol with formatted text
      this.form.content = [content.slice(0, this.atPosition - 1), formattedMentionText, content.slice(this.atPosition)].join('')
    })
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

        if (isReply) {
          replyToCommentId = replyToComment['.key']
        }

        let commentURL
        let countURL
        let postData = { authorUid, date, order, content, replyToCommentId, ip }
        if (rootComment) {
          commentURL = `/pages/${encodedPageURL}/replies/${rootComment['.key']}`
          countURL = `/pages/${encodedPageURL}/comments/${rootComment['.key']}/repliesCount`
        } else if (isReply) {
          commentURL = `/pages/${encodedPageURL}/replies/${replyToComment['.key']}`
          countURL = `/pages/${encodedPageURL}/comments/${replyToComment['.key']}/repliesCount`
        } else {
          commentURL = `/pages/${encodedPageURL}/comments`
          countURL = `/pages/${encodedPageURL}/commentsCount`
          postData = Object.assign({}, postData, {repliesCount: 0})
        }

        var newNode = this.$database.ref(commentURL).push(postData)
        /*
          There is a difference between `firebase` and `wilddog`
          Note:
            - firebase: ref.key
            - wilddog: ref.key()
         */
        const newKey = this.$config.databaseProvider === 'firebase' ? newNode.key : newNode.key()

        newNode.then(() => {
          this.$database.ref(countURL).transaction((currentCount) => {
            return (currentCount || 0) + 1
          }).then(() => {
            this.isPosting = false
            this.$emit('finished-replying') // When successfully posted reply, hide current reply area
            this.form.content = ''
            this.$Message.success(this.$i18next.t('text/commentPosted'))

            /*
              Handle Mention
             */
            // Forbid anonymous user to use Mention
            if (!this.user) { return }

            const mentions = content.match(new RegExp('\\[@([^\\[\\]]+)\\]\\([^\\(\\)]+\\)', 'g')) || []
            if (users.length !== 0) {
              mentions.forEach(mention => {
                const email = mention.slice(mention.indexOf('(') + 1, -1)
                const mentionedUid = this.users.find(user => user.email === email).id

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
            /*
              End of: Handle Mention
             */
          })
        })
        .catch((error) => {
          this.isPosting = false
          this.form.content = ''
          this.$Message.error(this.$i18next.t('error/failedToPostComment'))
          console.log(error)
        })
      }
    },
    contentOnChange (e) {
      // Forbid anonymous user to use Mention
      if (!this.user) { return }

      this.shouldShowAutoComplete = true
      if (e.data === '@' && this.isMentionEnabled) {
        this.atPosition = e.target.selectionStart
        Bus.$emit('ShowMentionAutoComplete', this._uid)
      }
    }
  }
}
</script>

<style scoped>
img { width: 48px; height: 48px; }
.wf-reply img { width: 36px; height: 36px; }
.no-bottom-margin {    /*margin-bottom: 0;*/ }
.float-to-right { text-align: right; }
.ivu-form .ivu-form-item-label { padding: 0; text-align: left; }
.ivu-form { margin-top: 10px; }
.ivu-form-item { margin-bottom: 12px; }
</style>
