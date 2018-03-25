<template>
  <li class="wf-comment-item" :class="{'wf-reply-item': !isTopLevelComment}">
    <section class="wf-section-comment">
      <div class="wf-avatar">
        <img
          :src="author.photoURL"
          :class="{ 'wf-anonymous': isPostedByAnonymousUser }"
          @error="avatarOnError" />
      </div>
      <div class="wf-comment-body">
        <header class="wf-comment-header">
          <div class="wf-content">
            <a class="wf-username" :title="author.displayName" @click="showUserInfo">{{shortenedUsername(author.displayName)}}</a>
            <i-poptip
              v-if="!isTopLevelComment"
              trigger="hover"
              placement="top">
              <span class="wf-parent-link">
                <i-icon type="forward"></i-icon>
                {{shortenedUsername(replyToComment.author.displayName)}}
              </span>
              <div
                v-if="replyToComment.content &&
                      replyToComment.author.displayName &&
                      replyToComment.author.photoURL"
                slot="content"
                class="wf-reply-poptip">
                <img
                  :src="replyToComment.author.photoURL"
                  :class="{ 'wf-anonymous': replyToComment.author.isAnonymous }"
                  @error="avatarOnError">
                <div>
                  <span :title="replyToComment.author.displayName">
                    <strong>{{replyToComment.author.displayName}}</strong>
                  </span>
                  <span :title="textContent(replyToComment.content)">{{textContent(replyToComment.content)}}</span>
                </div>
              </div>
              <div slot="content" v-else>
                {{t('CommentCard.text.loading_comments_content')}}
              </div>
            </i-poptip>
            <span class="wf-meta">
              <i-poptip
                :content="formatDate(comment.date)"
                trigger="hover"
                placement="right">
              · {{distanceInWordsToNow(comment.date)}}
              </i-poptip>
            </span>
          </div>
          <i-dropdown v-if="this.user"
            trigger="click"
            placement="bottom-end"
            @on-click="handleDropdownClick">
            <a href="javascript:void(0)" class="wf-dropdown-menu-button">
              <i-icon type="arrow-down-b"></i-icon>
            </a>
            <i-dropdown-menu slot="list">
              <component
                v-for="(cpntName, idx) in pluginComponents.comment.menu.top"
                :is="cpntName"
                :key="cpntName+idx"
                :comment="comment"
                v-bind="pluginProps(cpntName)"/>
              <i-dropdown-item v-if="!user || !user.isAdmin" style="color: red"
                name="reportCurrentComment">
                {{t('CommentCard.btn.report_comment')}}
              </i-dropdown-item>
              <i-dropdown-item v-if="user && user.isAdmin" style="color: red"
                name="banCurrentUser">
                {{t('CommentCard.btn.ban_user')}}
              </i-dropdown-item>
              <component
                v-for="(cpntName, idx) in pluginComponents.comment.menu.bottom"
                :is="cpntName"
                :key="cpntName+idx"
                :comment="comment"
                v-bind="pluginProps(cpntName)"/>
            </i-dropdown-menu>
          </i-dropdown>
        </header>
        <div class="wf-comment-content"
          :class="{'wf-code-overflow-hidden': !isShowingFullText}"
          :id="'wf-comment-content-'+comment.commentId">
          <div :class="{ 'wf-less': isContentTooLong && !isShowingFullText }">
            <wf-marked-content :content="comment.content"></wf-marked-content>
          </div>
          <i-button v-if="isContentTooLong"
            class="wf-toggle-content-btn"
            @click="isShowingFullText = !isShowingFullText"
            type="text" long>
            <template v-if="isShowingFullText">
              <i-icon type="chevron-up"></i-icon>
              {{t('CommentCard.btn.show_less_content')}}
            </template>
            <template v-else>
              <i-icon type="chevron-down"></i-icon>
              {{t('CommentCard.btn.show_full_content')}}
            </template>
          </i-button>
        </div>
        <footer class="wf-comment-footer">
          <a :title="t('CommentCard.html_title.like_comment')"
            :class="{
              'wf-inactive': likeUserIdList.indexOf(currentUserId) === -1,
              'wf-disabled': !user
            }"
            @click="toggleVote('like')">
            <span>{{likeUserIdList.length || ''}}</span>
            <i-icon type="heart"></i-icon>
          </a>
          <span class="wf-separator-v">|</span>
          <a :title="t('CommentCard.html_title.dislike_comment')"
            :class="{
              'wf-inactive': dislikeUserIdList.indexOf(currentUserId) === -1,
              'wf-disabled': !user
            }"
            @click="toggleVote('dislike')">
            <span>{{dislikeUserIdList.length || ''}}</span>
            <i-icon type="heart-broken"></i-icon>
          </a>
          <component
            v-for="(cpntName, idx) in pluginComponents.comment.buttons.pre"
            :is="cpntName"
            :key="cpntName+idx"
            :comment="comment"
            v-bind="pluginProps(cpntName)"/>
          <i-button
            type="text"
            class="wf-reply-btn"
            @click="toggleReplyArea">
            {{isShowingReplyArea ? t('CommentCard.btn.hide') : t('CommentCard.btn.reply')}}
          </i-button>
          <i-poptip
            confirm
            :title="t('CommentCard.confirm.deleting_comment')"
            @on-ok="confirmDelete">
            <i-button type="text" class="wf-delete-btn"
              v-if="canDelete">
              {{t('CommentCard.btn.delete')}}
            </i-button>
          </i-poptip>
          <component
            v-for="(cpntName, idx) in pluginComponents.comment.buttons.post"
            :is="cpntName"
            :key="cpntName+idx"
            :comment="comment"
            v-bind="pluginProps(cpntName)"/>
        </footer>
        <!-- If this is a comment -->
        <wf-reply-area v-if="!parentComment"
          v-show="isShowingReplyArea"
          ref="replyArea"
          :user="user"
          :reply-to-comment-author-username="author.displayName"
          :reply-to-comment="comment"
          @finished-replying="isShowingReplyArea = false"></wf-reply-area>
        <!-- If this is a reply (to a comment/reply) -->
        <wf-reply-area v-if="parentComment"
          v-show="isShowingReplyArea"
          ref="replyArea"
          :user="user"
          :reply-to-comment-author-username="author.displayName"
          :reply-to-comment="comment"
          :root-comment="parentComment"
          @finished-replying="isShowingReplyArea = false"></wf-reply-area>
      </div>
    </section>
    <section class="wf-section-replies">
      <ul class="wf-reply-group" v-if="isTopLevelComment">
        <wf-comment-card
          v-for="(reply, idx) in replies"
          v-show="!isShowingLessReplies ||
                  (isShowingLessReplies && idx < numberOfRepliesWhenShowingLess)"
          :key="reply.commentId"
          :user="user"
          :comment="reply"
          :parent-comment="comment"></wf-comment-card>
        <i-button type="text"
          v-show="replies.length > numberOfRepliesWhenShowingLess"
          @click="isShowingLessReplies = !isShowingLessReplies"
          long>
          <template v-if="isShowingLessReplies">
            <i-icon type="chevron-down"></i-icon>
            {{t('CommentCard.btn.show_more_discussion', { count: foldedDiscussionCount })}}
          </template>
          <template v-else>
            <i-icon type="chevron-up"></i-icon>
            {{t('CommentCard.btn.show_less_discussion', { count: foldedDiscussionCount })}}
          </template>
        </i-button>
      </ul>
    </section>
  </li>
</template>

<script>
import { bus, butler } from '../common';
import { PCM, PHM, handlePluginHookError, EVENTS, pluginProps } from '../plugin';
import { textContent, handleImageOnError } from '../utils';
import errorImage from '../assets/images/error-image.svg';

const MAX_CONTENT_HEIGHT = 180;

/*
  Wf Comment Card
  Note: this component is used for both top-level `comments`
        and lowerer level comments, or `replies` in
        this project.

        The comment hierarchy has only two levels. Comments
        to the current page are considered top-level. Replies
        to comments, or other replies, are second-level
        comments.
 */
export default {
  name: 'wf-comment-card',
  props: [
    'comment',
    'parentComment',
  ],
  data() {
    return {
      isShowingReplyArea: false,
      author: {
        displayName: '',
        photoURL: '',
        email: '',
      },
      isContentTooLong: false,
      isShowingFullText: true,
      replyToComment: {
        author: {
          isAnonymousUser: null,
          displayName: '',
          photoURL: '',
        },
        content: '',
      },
      votes: {
        likes: {},
        dislikes: {},
      },
      replies: [],
      _repliesCount: 0,
      isShowingLessReplies: true,
      numberOfRepliesWhenShowingLess: 4,
    };
  },
  computed: {
    pluginComponents: () => ({
      comment: {
        menu: {
          top: PCM.get('comment.menu.top'),
          bottom: PCM.get('comment.menu.bottom'),
        },
        buttons: {
          pre: PCM.get('comment.buttons.pre'),
          post: PCM.get('comment.buttons.post'),
        },
      },
    }),
    pluginProps: () => pluginProps,
    t: () => (key) => butler.i18next.t(key),
    distanceInWordsToNow: () => butler.distanceInWordsToNow,
    formatDate: () => butler.formatDate,
    user: () => bus.user,
    isCurrentUserBanned: () => bus.isCurrentUserBanned,
    textContent: () => textContent,
    isTopLevelComment() {
      return !this.comment.parentCommentId;
    },
    likeUserIdList() {
      return this.votes.likes === undefined ? [] : Object.keys(this.votes.likes);
    },
    dislikeUserIdList() {
      return this.votes.dislikes === undefined ? [] : Object.keys(this.votes.dislikes);
    },
    currentUserId() {
      return this.user ? this.user.uid : 'null';
    },
    isPostedByAnonymousUser() {
      return this.isAnonymousUser(this.comment.uid);
    },
    encodedPageURL() {
      return btoa(butler.config.pageURL);
    },
    canDelete() {
      return this.user && (this.user.uid === this.comment.uid || this.user.isAdmin);
    },
    foldedDiscussionCount() {
      return this.replies.length - this.numberOfRepliesWhenShowingLess;
    },
  },
  watch: {
    user(newVal) {
      if (newVal && this.comment.uid === newVal.uid) {
        const { displayName, photoURL, email } = newVal;
        this.author = Object.assign({}, { displayName, photoURL, email });
      }
    },
  },
  created() {
    // Init user info as anonymous user
    this.author.displayName = this.t('common.anonymous_user');
    this.author.photoURL = butler.config.defaultAvatarURL;
    this.replyToComment.author.isAnonymous = true;
    this.replyToComment.author.displayName = this.t('common.anonymous_user');
    this.replyToComment.author.photoURL = butler.config.defaultAvatarURL;

    if (!this.isPostedByAnonymousUser) {
      const authorUid = this.comment.uid;
      if (this.user && authorUid === this.user.uid) {
        // If is current user, use current user info
        this.author.photoURL = this.user.photoURL;
        this.author.displayName = this.user.displayName;
        this.author.email = this.user.email;
      } else {
        // Else (not anomymous user and not current user),
        // get username & avatar from DB
        butler.db.ref(`users/${authorUid}`).once('value').then((snapshot) => {
          const author = snapshot.val();

          /*
            Assign value only when the value exists,
            otherwise use default anonymous user info value.
           */
          if (!author) { return; }

          if (author.photoURL) { this.author.photoURL = author.photoURL; }
          if (author.displayName) { this.author.displayName = author.displayName; }
          if (author.email) { this.author.email = author.email; }
        });
      }
    }

    // Get Voting data
    this.$bindAsObject('votes', butler.db.ref(`votes/${this.comment.commentId}`));

    // If this comment is (1) a reply to comment, or
    // (2) a reply to a reply, get corresponding detail data.
    if (!this.isTopLevelComment) {
      butler.db.ref(`comments/${this.comment.parentCommentId}`).once('value').then((snapshot) => {
        const comment = snapshot.val();
        if (!comment) {
          this.replyToComment.content = this.t('CommentCard.text.deleted_comment');
          return;
        }
        this.replyToComment.content = comment.content;
        const replyToCommentAuthorUid = comment.uid;
        if (!this.isAnonymousUser(replyToCommentAuthorUid)) {
          butler.db.ref(`users/${replyToCommentAuthorUid}`).once('value').then((snapshot) => {
            const author = snapshot.val();
            /*
              Assign value only when the value exists,
              otherwise use default anonymous user info value.
             */
            if (!author) { return; }
            if (author.displayName) {
              this.replyToComment.author.displayName = author.displayName;
              this.replyToComment.author.isAnonymous = false;
            }
            if (author.photoURL) { this.replyToComment.author.photoURL = author.photoURL; }
          });
        }
      });
    } else {
    // If the comment is top-level comment,
    // get its replies.
      const { commentId } = this.comment;
      butler.db.ref('comments').orderByChild('rootCommentId').equalTo(commentId).on('child_added', (snap) => {
        const reply = snap.val();
        this.replies.push(Object.assign(reply, { commentId: butler.config.databaseProvider === 'firebase' ? snap.key : snap.key() }));
      });
      butler.db.ref('comments').orderByChild('rootCommentId').equalTo(commentId).on('child_removed', (snap) => {
        const key = butler.config.databaseProvider === 'firebase' ? snap.key : snap.key();
        const idx = this.replies.findIndex(reply => reply.commentId === key);
        this.replies.splice(idx, 1);
      });
    }
  },
  mounted() {
    const contentEle = document.getElementById(`wf-comment-content-${this.comment.commentId}`);
    this.checkShouldFold(contentEle);

    const imgEles = contentEle.getElementsByTagName('img');
    for (let i = imgEles.length - 1; i >= 0; i -= 1) {
      imgEles[i].onload = () => {
        this.checkShouldFold(contentEle);
      };
      imgEles[i].onerror = (event) => {
        const imageEle = event.target;
        const title = this.t('CommentCard.html_title.image_onerror');

        imageEle.className = 'wf-error-image';
        handleImageOnError(imageEle, errorImage, title);
        this.checkShouldFold(contentEle);
      };
    }

    bus.listenTo('OnlyOneReplyAreaShouldBeActive', activeReplyAreaId => {
      if (this.$refs.replyArea._uid !== activeReplyAreaId) {
        this.isShowingReplyArea = false;
      }
    }, this.$refs.replyArea._uid);
  },
  beforeDestroy() {
    bus.enough('CurrentUserInfoUpdated', null, this._uid);
  },
  methods: {
    isAnonymousUser(uid) {
      const { anonymousUserId } = butler.config;
      return !uid || uid === anonymousUserId;
    },
    shortenedUsername(username) {
      if (username.length > 10) { return `${username.slice(0, 10)}...`; }
      return username;
    },
    checkShouldFold(contentEle) {
      /*
        Calculate comment content height
        Note: If longer than MAX_CONTENT_HEIGHT, then fold.
       */
      const contentEleHeight = parseInt(window.getComputedStyle(contentEle).height, 10);
      if (contentEleHeight > MAX_CONTENT_HEIGHT) {
        this.isContentTooLong = true;
        this.isShowingFullText = false;
      } else {
        this.isContentTooLong = false;
        this.isShowingFullText = true;
      }
    },
    avatarOnError(event) {
      handleImageOnError(
        event.target,
        butler.config.defaultAvatarURL,
        this.t('CommentCard.html_title.image_onerror'),
      );
    },
    toggleReplyArea() {
      this.isShowingReplyArea = !this.isShowingReplyArea;
      bus.$emit('OnlyOneReplyAreaShouldBeActive', this.$refs.replyArea._uid);
    },
    /**
     * @param  {string='like', 'dislike'} type
     */
    // TODO: refactor
    toggleVote(type) {
      if (!this.user) { return; }
      if (this.isCurrentUserBanned) {
        this.$Modal.error({
          title: this.t('CommentCard.error.banned_title'),
          content: this.t('CommentCard.error.banned_content'),
          okText: this.t('CommentCard.btn.confirm'),
        });
        return;
      }

      const { uid } = this.user;
      const now = (new Date()).toISOString();
      const { commentId } = this.comment;

      const isLiked = uid in (this.votes.likes || {});
      const isDisliked = uid in (this.votes.dislikes || {});
      const isLikeAction = (type === 'like');

      const current = {
        isLike: isLiked,
        isDislike: isDisliked,
      }
      const next = {
        isLike: !isLiked && isLikeAction,
        isDislike: !isDisliked && !isLikeAction,
      }

      PHM.beforeEvent(EVENTS.VOTE_COMMENT, {
        comment: this.comment,
        current,
        next,
      })
        .then(() => {
          const votedEventCallback = (error) => {
            if (error) {
              PHM.afterEvent(EVENTS.VOTE_COMMENT, { error, current, next });
            } else {
              PHM.afterEvent(EVENTS.VOTE_COMMENT, {
                comment: this.comment,
                last: current,
                current: next,
              });
            }
          };

          if (isLikeAction) {
            if (isLiked) {
              butler.db.ref(`votes/${commentId}/likes/${uid}`).remove()
                .then(() => votedEventCallback())
                .catch(error => votedEventCallback(error));
            } else {
              Promise.all([
                butler.db.ref(`votes/${commentId}/likes/${uid}`).set(now),
                butler.db.ref(`votes/${commentId}/dislikes/${uid}`).remove(),
              ]).then(() => votedEventCallback())
                .catch(error => votedEventCallback(error));
            }
          } else if (isDisliked) {
            butler.db.ref(`votes/${commentId}/dislikes/${uid}`).remove()
              .then(() => votedEventCallback())
              .catch(error => votedEventCallback(error));
          } else {
            Promise.all([
              butler.db.ref(`votes/${commentId}/dislikes/${uid}`).set(now),
              butler.db.ref(`votes/${commentId}/likes/${uid}`).remove(),
            ]).then(() => votedEventCallback())
              .catch(error => votedEventCallback(error));
          }
        })
        .catch((error) => {
          handlePluginHookError(error);
        })
    },
    confirmDelete() {
      PHM.beforeEvent(EVENTS.DELETE_COMMENT, { comment: this.comment })
        .then(() => {
          const { commentId } = this.comment;
          const { pageURL } = butler.config;

          Promise.all([
            butler.db.ref(`comments/${commentId}`).remove(),
            butler.db.ref(`votes/${commentId}`).remove(),
            // Note: [todo] should move "deleting votes" outside of
            //        this batch. "votes" data shouldn't be writable
            //        by all users, because site owner cannot recover
            //        "votes" data with other unmutalbe data.
            ...(this.isTopLevelComment
              ? [
                butler.db.ref(`pageComments/${pageURL}/${commentId}`).remove(),
                ...this.replies.map(reply => [
                  butler.db.ref(`comments/${reply.commentId}`).remove(),
                  butler.db.ref(`votes/${reply.commentId}`).remove(),
                  butler.db.ref(`pageComments/${pageURL}/${reply.commentId}`).remove(),
                ]),
              ]
              : [butler.db.ref(`pageComments/${pageURL}/${commentId}`).remove()]),
          ]).then(() => {
            this.$Message.success(this.t('CommentCard.success.deleting_comment'));
            PHM.afterEvent(EVENTS.DELETE_COMMENT, { comment: this.comment });
          }).catch(error => {
            this.$Message.error(this.t('CommentCard.error.deleting_comment'));
            PHM.afterEvent(EVENTS.DELETE_COMMENT, { error, comment: this.comment });
          });
        })
        .catch((error) => {
          handlePluginHookError(error);
        })
    },
    handleDropdownClick(name) {
      if (this[name]) {
        this[name]();
      }
    },
    reportCurrentComment() {
      if (!this.user) { return; }
      if (this.isCurrentUserBanned) {
        this.$Modal.error({
          title: this.t('CommentCard.error.banned_title'),
          content: this.t('CommentCard.error.banned_content'),
          okText: this.t('CommentCard.btn.confirm'),
        });
        return;
      }

      PHM.beforeEvent(EVENTS.REPORT_COMMENT, { comment: this.comment })
        .then(() => {
          butler.db.ref(`reported/${this.comment.commentId}/${this.user.uid}`)
            .once('value').then((snapshot) => {
              if (snapshot.val()) {
                this.$Message.error(this.t('CommentCard.error.repeated_reporting'));
                return;
              }

              butler.db.ref(`reported/${this.comment.commentId}/${this.user.uid}`).set((new Date()).toISOString())
                .then(() => {
                  this.$Message.success(this.t('CommentCard.success.reporting_comment'));

                  PHM.afterEvent(EVENTS.REPORT_COMMENT, { comment: this.comment });
                }).catch(error => {
                  this.$Message.error(this.t('CommentCard.error.reporting_comment'));

                  PHM.afterEvent(EVENTS.REPORT_COMMENT, { error, comment: this.comment });
                });
            });
        })
        .catch((error) => {
          handlePluginHookError(error);
        })

    },
    banCurrentUser() {
      let key;
      let type;
      if (this.comment.uid !== butler.config.anonymousUserId) {
        key = this.comment.uid;
        type = 'uid';
      } else if (/unknow/.test(this.comment.ip)) {
        this.$Message.error(this.t('CommentCard.error.banning_user'));
        return;
      } else {
        key = this.comment.ip.replace(/\./g, '-');
        type = 'ip';
      }
      PHM.beforeEvent(EVENTS.BAN_USER, { type, userKey: key })
        .then(() => {
          butler.db.ref(`ban/${key}`).once('value').then((snapshot) => {
            if (snapshot.val()) {
              this.$Message.error(this.t('CommentCard.error.repeated_banning'));
              return;
            }
            butler.db.ref(`ban/${key}`).set({
              date: (new Date()).toISOString(),
              reason: 'comment',
            }).then(() => {
              this.$Message.success(this.t('CommentCard.success.banning_user'));

              PHM.afterEvent(EVENTS.BAN_USER, { type, userKey: key });
            }).catch((error) => {
              this.$Message.error(this.t('CommentCard.error.banning_user'));

              PHM.afterEvent(EVENTS.BAN_USER, { error, type, userKey: key });
            });
          });
        })
        .catch((error) => {
          handlePluginHookError(error);
        })
    },
    showUserInfo() {
      bus.$emit('ShowUserInfo', {
        uid: this.comment.uid,
        displayName: this.author.displayName,
        photoURL: this.author.photoURL,
        email: this.author.email,
        ip: this.comment.ip,
      });
    },
  },
};
</script>
