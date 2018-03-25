<template>
  <i-form :model="form"
    :label-width="60"
    class="wf-reply-form"
    :class="{ 'wf-is-reply': isReply }">
    <i-form-item class="wf-no-bottom-margin">
      <img slot="label" :src="avatarURL" :class="{ 'wf-anonymous': user === null }" @error="avatarOnError">
      <i-input
        v-model="form.content"
        type="textarea"
        @on-focus="contentOnFocus"
        @on-change="contentOnChange"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :placeholder="placeholder"
        :disabled="shouldDisableInput"></i-input>
    </i-form-item>
    <section class="wf-is-main" v-if="isMain">
      <div class="wf-tool-bar">
        <i-tooltip placement="right" :content="mentionLabel">
          <i-icon type="at" size="14" :class="{ 'wf-inactive': !isMentionAvailable }"></i-icon>
        </i-tooltip>
        <component
          v-for="(cpntName, idx) in pluginComponents.comments.before"
          :is="cpntName"
          :key="cpntName+idx"
          v-bind="pluginProps(cpntName)"/>
        <component
          v-for="(cpntName, idx) in pluginComponents.toolbar"
          :is="cpntName"
          :key="cpntName+idx"
          v-bind="pluginProps(cpntName)"/>
      </div>
      <div>
        <i-button type="text"
          class="wf-clear-btn"
          :disabled="shouldDisableButton"
          @click="form.content = ''">
          {{t('ReplyArea.btn.clear')}}
        </i-button>

        <i-button :type="isPosting ? 'ghost' : 'primary'"
          class="wf-post-btn"
          style="margin-left: 8px"
          @click="postComment"
          :disabled="shouldDisableButton"
          :loading="isPosting">
          {{t(isPosting ? 'ReplyArea.btn.posting' : 'ReplyArea.btn.post')}}
        </i-button>
      </div>
    </section>

    <i-form-item class="wf-float-right" v-else>
      <i-button type="text"
        :disabled="shouldDisableButton"
        @click="form.content = ''">
        {{t('ReplyArea.btn.clear')}}
      </i-button>

      <i-button :type="isPosting ? 'ghost' : 'primary'"
        style="margin-left: 8px"
        @click="postComment"
        :disabled="shouldDisableButton"
        :loading="isPosting">
        {{t(isPosting ? 'ReplyArea.btn.posting' : 'ReplyArea.btn.post')}}
      </i-button>
    </i-form-item>
  </i-form>
</template>

<script>
import { bus, butler } from '../common';
import { PHM, PCM, handlePluginHookError, EVENTS, pluginProps } from '../plugin';
import { handleImageOnError, getKey } from '../utils';

export default {
  name: 'wf-reply-area',
  props: [
    'replyToCommentAuthorUsername',
    'replyToComment',
    'rootComment',
    'commentsLoadingState',
    'pageCommentsCount',
    'rootCommentRepliesCount',
    'isMain',
  ],
  data() {
    return {
      isPosting: false,
      form: {
        content: '',
      },
      users: [],
      mentioningUsername: '',
      atPosition: null,
      shouldShowAutoComplete: false,
    };
  },
  computed: {
    pluginComponents: () => ({
      comments: {
        before: PCM.get('comments.before'),
      },
      toolbar: PCM.get('toolbar'),
    }),
    pluginProps: () => pluginProps,
    t: () => (key) => butler.i18next.t(key),
    user: () => bus.user,
    avatarURL() {
      return this.user
        ? this.user.photoURL
        : butler.config.defaultAvatarURL;
    },
    username() {
      return this.user
        ? this.t('common.anonymous_user')
        : this.user.displayName;
    },
    placeholder() {
      if (this.isCurrentUserBanned) {
        return this.t('ReplyArea.placeholder.user_is_banned');
      }
      if (this.isReply) {
        return this.t('ReplyArea.placeholder.reply_to_user_comment', { username: this.replyToCommentAuthorUsername });
      }
      if (this.user) {
        return this.t('ReplyArea.placeholder.join_conversation');
      }
      return this.t('ReplyArea.placeholder.join_conversation_anonymously');
    },
    isReply() {
      return !!this.replyToComment;
    },
    isCurrentUserBanned: () => bus.isCurrentUserBanned,
    shouldDisableInput() {
      return this.isPosting || this.commentsLoadingState === 'loading' || this.isCurrentUserBanned;
    },
    shouldDisableButton() {
      return this.form.content.trim() === '' || this.isPosting || this.isCurrentUserBanned;
    },
    isLoadingUserData: () => bus.isLoadingUserData,
    isMentionEnabled() {
      return !this.isLoadingUserData;
    },
    isMentionAvailable() {
      return this.isMentionEnabled && this.user && !this.isCurrentUserBanned;
    },
    mentionLabel() {
      if (this.isLoadingUserData) {
        return this.t('ReplyArea.text.initializing_mention_autocomplete');
      }
      if (this.isCurrentUserBanned) {
        return this.t('ReplyArea.text.mention_func_not_authorized_banned_user');
      }
      if (this.user) {
        return this.t('ReplyArea.text.initialized_mention_autocomplete');
      }
      return this.t('ReplyArea.text.mention_func_not_authorized');
    },
  },
  mounted() {
    /**
     * ↓Observe `MentionAutoCompleteSelected` event
     *  Update current reply area when recieves the event.
     */
    bus.$on(`MentionAutoCompleteSelected-${this._uid}`, formattedMentionText => {
      const { content } = this.form;
      // replace the '@' symbol with formatted text
      this.form.content = [content.slice(0, this.atPosition - 1), formattedMentionText, content.slice(this.atPosition)].join('');
    });
  },
  beforeDestroy() {
    bus.enough('OnlyOneReplyAreaShouldBeActive', null, this._uid);
    bus.enough(`MentionAutoCompleteSelected-${this._uid}`);
  },
  methods: {
    isAnonymousUser(uid) {
      const { anonymousUserId } = butler.config;
      return !uid || uid === anonymousUserId;
    },
    avatarOnError(event) {
      handleImageOnError(
        event.target,
        butler.config.defaultAvatarURL,
        this.t('CommentCard.html_title.image_onerror'),
      );
    },
    postComment() {
      if (this.isPosting) { return; }

      // If user manage to activate the reply area,
      // and try to post new comment :-D
      if (this.isCurrentUserBanned) {
        this.$Modal.error({
          title: this.t('ReplyArea.error.banned_title'),
          content: this.t('ReplyArea.error.banned_content'),
          okText: this.t('ReplyArea.btn.confirm'),
        });
        return;
      }

      this.isPosting = true;
      const { content } = this.form;
      const {
        user, users, isReply, replyToComment,
      } = this;

      if (content.trim() !== '') {
        const aDate = new Date();
        const { ip } = bus.info;
        const uid = user ? user.uid : butler.config.anonymousUserId;
        const date = aDate.toISOString();

        let pageURL = null;
        let rootCommentPageURL = null;
        let parentCommentId = null;
        let parentCommentUid = null;
        let rootCommentId = null;
        let rootCommentUid = null;

        if (isReply) {
          // The field `pageURL` of a comment is used to determine
          // whether it's a top-level comment or not.
          // As shown in `App.vue`, pageURL` is used as a filter
          // for retrieving comments of a page.
          // If the comment is top-level comment, then it has `pageURL`;
          // else, it has `rootCommentPageURL`.
          rootCommentPageURL = butler.config.pageURL;
          parentCommentId = replyToComment.commentId;
          parentCommentUid = replyToComment.uid;
          if (replyToComment.rootCommentId) {
            ({ rootCommentId, rootCommentUid } = replyToComment);
          } else {
            rootCommentId = replyToComment.commentId;
            rootCommentUid = replyToComment.uid;
          }
        } else {
          ({ pageURL } = butler.config);
        }

        const postData = {
          uid,
          content,
          date,
          ip,
          pageURL,
          rootCommentPageURL,
          parentCommentId,
          parentCommentUid,
          rootCommentId,
          rootCommentUid,
        };

        /**
         * Plugin Hook Event: postComment
         */
        PHM.beforeEvent(EVENTS.POST_COMMENT, { comment: postData })
          .then(() => {
            const newNode = butler.db.ref().push();
            const newCommentId = getKey(newNode);
            const pageCommentsData = {
              authorUid: uid,
              relatedUid: rootCommentUid,
              rootCommentId,
            };

            Promise.all([
              butler.db.ref(`comments/${newCommentId}`).update(postData),
              butler.db.ref(`pageComments/${butler.config.pageURL}/${newCommentId}`).set(pageCommentsData),
            ])
              .then(() => {
                this.isPosting = false;
                this.$emit('finished-replying'); // When successfully posted reply, hide current reply area
                this.form.content = '';
                this.$Message.success(this.t('ReplyArea.success.posting_comment'));

                PHM.afterEvent(EVENTS.POST_COMMENT, {
                  comment: Object.assign({}, postData, { commentId: newCommentId }),
                });

                /**
                * Handle mention
                */
                const { admin } = bus;

                let shouldNotifyAdmin = true;
                let shouldNotifyParentCommentAuthor = true;
                let shouldNotifyRootCommentAuthor = true;
                const isAdminMentioned = false;
                const isParentCommentAuthorMentioned = false;
                const isRootCommentAuthorMentioned = false;
                // If no admin exists,
                // then no notification to `admin`.
                if (!admin) {
                  shouldNotifyAdmin = false;
                // If current user is admin,
                // then no notification to `admin`.
                } else if (user && user.uid === admin.uid) {
                  shouldNotifyAdmin = false;
                }
                // If replying to comment posted by
                //  (1) anonymous user,
                //  (2) self, or
                //  (3) admin,
                // or new comment is top-level comment,
                // then no notification to `parentCommentAuthor`.
                if (!replyToComment || this.isAnonymousUser(replyToComment.uid)) {
                  shouldNotifyParentCommentAuthor = false;
                } else if (user && user.uid === replyToComment.uid) {
                  shouldNotifyParentCommentAuthor = false;
                } else if (admin && admin.uid === replyToComment.uid) {
                  shouldNotifyParentCommentAuthor = false;
                }
                // If `rootComment` posted by
                //  (1) anonymous user,
                //  (2) self, or
                //  (3) admin,
                // or new comment is top-level comment,
                // or `rootCommentAuthor` is `parentCommentAuthor`,
                // then no notification to `rootCommentAuthor`.
                if (!replyToComment || this.isAnonymousUser(replyToComment.rootCommentUid)) {
                  shouldNotifyRootCommentAuthor = false;
                } else if (user && user.uid === replyToComment.rootCommentUid) {
                  shouldNotifyRootCommentAuthor = false;
                } else if (admin && admin.uid === replyToComment.rootCommentUid) {
                  shouldNotifyRootCommentAuthor = false;
                } else if (replyToComment.uid === replyToComment.rootCommentUid) {
                  shouldNotifyRootCommentAuthor = false;
                }

                const notifyFlags = {
                  shouldNotifyAdmin,
                  shouldNotifyParentCommentAuthor,
                  shouldNotifyRootCommentAuthor,
                };
                const mentionFlags = {
                  isAdminMentioned,
                  isParentCommentAuthorMentioned,
                  isRootCommentAuthorMentioned,
                };
                // Forbid anonymous user to use Mention
                if (!this.user) {
                  this.handleNotifications([], newCommentId, notifyFlags, mentionFlags);
                  return;
                }
                const mentions = content.match(new RegExp('\\[@([^\\[\\]]+)\\]\\([^\\(\\)]+\\)', 'g')) || [];
                if (users.length !== 0) {
                  const mentionedUids = mentions.map(mention => this.users.find(user => user.email === mention.slice(mention.indexOf('(') + 1, -1)).id);
                  this.handleNotifications(mentionedUids, newCommentId, notifyFlags, mentionFlags);
                } else {
                  Promise.all(mentions.map(mention => {
                    const email = mention.slice(mention.indexOf('(') + 1, -1);
                    return butler.db.ref('users').orderByChild('email').equalTo(email).once('value');
                  })).then(snaps => {
                    const mentionedUids = (
                      snaps.map(snap => (snap.val()
                        ? Object.keys(snap.val())[0]
                        : undefined))
                    );
                    this.handleNotifications(mentionedUids, newCommentId, notifyFlags, mentionFlags);
                  });
                }
              })
              .catch(error => {
                this.isPosting = false;
                this.form.content = '';
                this.$Message.error(this.t('ReplyArea.error.posting_comment'));

                PHM.afterEvent(EVENTS.POST_COMMENT, { error, comment: postData });
              });
          })
          .catch((error) => {
            this.isPosting = false;
            handlePluginHookError(error);
          })
      }
    },
    handleNotifications(mentionedUids, commentId, notifyFlags, mentionFlags) {
      const { user } = this;
      const { admin } = bus;
      const {
        shouldNotifyAdmin,
        shouldNotifyParentCommentAuthor,
        shouldNotifyRootCommentAuthor,
      } = notifyFlags;
      let {
        isAdminMentioned,
        isParentCommentAuthorMentioned,
        isRootCommentAuthorMentioned,
      } = mentionFlags;
      const { pageURL } = butler.config;
      mentionedUids.forEach(mentionedUid => {
        // Incase uid is undefined/null
        if (!mentionedUid) { return; }

        // If mentioning self, no notification.
        if (mentionedUid === user.uid) { return; }
        // If mentioning (1) admin, (2) parentCommentAuthor,
        // or (3) rootCommentAuthor, then set related flag
        // and leave the notification
        if (admin && mentionedUid === admin.uid) {
          isAdminMentioned = true;
          return;
        }
        if (this.replyToComment && mentionedUid === this.replyToComment.uid) {
          isParentCommentAuthorMentioned = true;
          return;
        }
        if (this.replyToComment && mentionedUid === this.replyToComment.rootCommentUid) {
          isRootCommentAuthorMentioned = true;
          return;
        }
        // Post notification to mentioned user
        this.postNotification({
          uid: mentionedUid,
          type: 'm',
          pageURL,
          pageTitle: butler.config.pageTitle,
          commentId,
        });
      });

      if (shouldNotifyAdmin) {
        let type;
        if (isAdminMentioned) {
          type = 'm';
        } else if (this.replyToComment) {
          if (this.replyToComment.uid === admin.uid) {
            type = 'r';
          } else {
            type = 'd';
          }
        } else {
          type = 'c';
        }
        this.postNotification({
          uid: admin.uid,
          type,
          pageURL,
          pageTitle: butler.config.pageTitle,
          commentId,
        });
      }
      if (shouldNotifyParentCommentAuthor) {
        this.postNotification({
          uid: this.replyToComment.uid,
          type: isParentCommentAuthorMentioned ? 'm' : 'r',
          pageURL,
          pageTitle: butler.config.pageTitle,
          commentId,
        });
      }
      if (shouldNotifyRootCommentAuthor) {
        this.postNotification({
          uid: this.replyToComment.rootCommentUid,
          type: isRootCommentAuthorMentioned ? 'm' : 'd',
          pageURL,
          pageTitle: butler.config.pageTitle,
          commentId,
        });
      }
    },
    postNotification(data) {
      const aDate = new Date();
      const date = aDate.toISOString();
      const {
        uid, type, pageURL = null, pageTitle = null, commentId = null, content = null,
      } = data;
      butler.db.ref(`notifications/${uid}`).push({
        type,
        pageURL,
        pageTitle,
        commentId,
        content,
        date,
        isRead: false,
      });
    },
    contentOnFocus() {
      if (this.isMain) {
        bus.$emit('OnlyOneReplyAreaShouldBeActive', 'MainReplyArea');
      }
    },
    contentOnChange(e) {
      // Forbid anonymous user to use Mention
      if (!this.user) { return; }

      this.shouldShowAutoComplete = true;
      if (e.data === '@' && this.isMentionEnabled) {
        this.atPosition = e.target.selectionStart;
        bus.$emit('ShowMentionAutoComplete', this._uid);
      }
    },
  },
};
</script>
