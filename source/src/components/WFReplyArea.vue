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
    isAnonymousUser (uid) {
      const { anonymousUserId } = this.$config
      return !uid || uid === anonymousUserId
    },
    postComment () {
      if (this.isPosting) { return }

      this.isPosting = true
      const { content } = this.form
      const { user, users, isReply, encodedPageURL, replyToComment } = this
      const { anonymousUserId } = this.$config

      if (content.trim() !== '') {
        const aDate = new Date()
        const ip = this.$ip
        const uid = user ? user.uid : anonymousUserId
        const date = aDate.toISOString()

        let pageURL = null
        let parentCommentId = null
        let rootCommentId = null

        if (isReply) {
          parentCommentId = replyToComment['.key']
          if (replyToComment.rootCommentId) {
            rootCommentId = replyToComment.rootCommentId
          } else {
            rootCommentId = replyToComment['.key']
          }
        } else {
          pageURL = encodedPageURL
        }

        const postData = { uid, content, date, ip, pageURL, parentCommentId, rootCommentId }

        var newNode = this.$database.ref().push()
        /*
          There is a difference between `firebase` and `wilddog`
          Note:
            - firebase: ref.key
            - wilddog: ref.key()
         */
        const newKey = this.$config.databaseProvider === 'firebase' ? newNode.key : newNode.key()

        let updates = {}
        updates[`comments/${newKey}`] = postData
        if (isReply) {
          updates[`commentReplies/${rootCommentId}/${newKey}`] = date
        } else {
          updates[`pages/${encodedPageURL}/comments/${newKey}`] = date
        }

        this.$database.ref().update(updates).then(() => {
          this.isPosting = false
          this.$emit('finished-replying') // When successfully posted reply, hide current reply area
          this.form.content = ''
          this.$Message.success(this.$i18next.t('text/commentPosted'))

          /*
            Handle Mention
           */
          // Forbid anonymous user to use Mention
          if (!this.user) { return }

          const admin = Bus.$data.admin

          let shouldNotifyAdmin = true
          let shouldNotifyParentCommentAuthor = true
          let shouldNotifyRootCommentAuthor = true
          let isAdminMentioned = false
          let isParentCommentAuthorMentioned = true
          let isRootCommentAuthorMentioned = true
          // If current user is admin,
          // then no notification to `admin`.
          if (user && user.uid === admin.uid) {
            shouldNotifyAdmin = false
          }
          // If replying to comment posted by
          //  (1) anonymous user,
          //  (2) self, or
          //  (3) admin,
          // then no notification to `parentCommentAuthor`.
          if (!replyToComment || this.isAnonymousUser(replyToComment.uid)) {
            shouldNotifyParentCommentAuthor = false
          } else if (user && user.uid === replyToComment.uid) {
            shouldNotifyParentCommentAuthor = false
          } else if (admin.uid === replyToComment.uid) {
            shouldNotifyParentCommentAuthor = false
          }
          // If `rootComment` posted by
          //  (1) anonymous user,
          //  (2) self, or
          //  (3) admin,
          // then no notification to `rootCommentAuthor`.
          if (!replyToComment || this.isAnonymousUser(replyToComment.rootCommentUid)) {
            shouldNotifyRootCommentAuthor = false
          } else if (user && user.uid === replyToComment.rootCommentUid) {
            shouldNotifyRootCommentAuthor = false
          } else if (admin.uid === replyToComment.rootCommentUid) {
            shouldNotifyRootCommentAuthor = false
          }

          const mentions = content.match(new RegExp('\\[@([^\\[\\]]+)\\]\\([^\\(\\)]+\\)', 'g')) || []
          if (users.length !== 0) {
            const mentionedUids = mentions.map(mention => this.users.find(user => user.email === mention.slice(mention.indexOf('(') + 1, -1)).id)
            this.handleNotifications(
              mentionedUids,
              newKey,
              {
                shouldNotifyAdmin,
                shouldNotifyParentCommentAuthor,
                shouldNotifyRootCommentAuthor
              },
              {
                isAdminMentioned,
                isParentCommentAuthorMentioned,
                isRootCommentAuthorMentioned
              }
              )
          } else {
            Promise.all(mentions.map(mention => {
              const email = mention.slice(mention.indexOf('(') + 1, -1)
              return this.$database.ref(`users`).orderByChild('email').equalTo(email).once('value')
            })).then(snaps => {
              const mentionedUids = snaps.map(snap => snap.val() ? Object.keys(snap.val())[0] : undefined)
              this.handleNotifications(
                mentionedUids,
                newKey,
                {
                  shouldNotifyAdmin,
                  shouldNotifyParentCommentAuthor,
                  shouldNotifyRootCommentAuthor
                },
                {
                  isAdminMentioned,
                  isParentCommentAuthorMentioned,
                  isRootCommentAuthorMentioned
                }
                )
            })
          }
          /*
            End of: Handle Mention
           */
        })
        .catch((error) => {
          this.isPosting = false
          this.form.content = ''
          this.$Message.error(this.$i18next.t('error/failedToPostComment'))
          console.log(error)
        })
      }
    },
    handleNotifications (mentionedUids, commentId, notifyFlags, mentionFlags) {
      const user = this.user
      const admin = Bus.$data.admin
      const {
        shouldNotifyAdmin,
        shouldNotifyParentCommentAuthor,
        shouldNotifyRootCommentAuthor
      } = notifyFlags
      let {
        isAdminMentioned,
        isParentCommentAuthorMentioned,
        isRootCommentAuthorMentioned
      } = mentionFlags
      mentionedUids.forEach(mentionedUid => {
        // Incase uid is undefined/null
        if (!mentionedUid) { return }

        // If mentioning self, no notification.
        if (mentionedUid === user.uid) { return }
        // If mentioning (1) admin, (2) parentCommentAuthor,
        // or (3) rootCommentAuthor, then set related flag
        // and leave the notification
        if (mentionedUid === admin.uid) {
          isAdminMentioned = true
          return
        }
        if (this.replyToComment && mentionedUid === this.replyToComment.uid) {
          isParentCommentAuthorMentioned = true
          return
        }
        if (this.replyToComment && mentionedUid === this.replyToComment.rootCommentUid) {
          isRootCommentAuthorMentioned = true
          return
        }
        // Post notification to mentioned user
        this.postNotification({
          uid: mentionedUid,
          type: 'm',
          pageURL: this.encodedPageURL,
          pageTitle: this.$config.pageTitle,
          commentId
        })
      })

      if (shouldNotifyAdmin) {
        this.postNotification({
          uid: admin.uid,
          type: isAdminMentioned
                ? 'm'
                : (this.replyToComment
                    ? (this.replyToComment.uid === admin.uid
                      ? 'r' : 'd')
                    : 'c'),
          pageURL: this.encodedPageURL,
          pageTitle: this.$config.pageTitle,
          commentId
        })
      }
      if (shouldNotifyParentCommentAuthor) {
        this.postNotification({
          uid: this.replyToComment.uid,
          type: isParentCommentAuthorMentioned ? 'm' : 'r',
          pageURL: this.encodedPageURL,
          pageTitle: this.$config.pageTitle,
          commentId
        })
      }
      if (shouldNotifyRootCommentAuthor) {
        this.postNotification({
          uid: this.replyToComment.rootCommentUid,
          type: isRootCommentAuthorMentioned
                ? 'm'
                : (this.replyToComment.parentCommentUid === this.replyToComment.rootCommentUid
                    ? 'r' : 'd'),
          pageURL: this.encodedPageURL,
          pageTitle: this.$config.pageTitle,
          commentId
        })
      }
    },
    postNotification (data) {
      const aDate = new Date()
      const date = aDate.toISOString()
      const {uid, type, pageURL = null, pageTitle = null, commentId = null, content = null} = data
      this.$database.ref('notifications').push({
        uid,
        type,
        pageURL,
        pageTitle,
        commentId,
        content,
        date,
        isRead: false
      })
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
