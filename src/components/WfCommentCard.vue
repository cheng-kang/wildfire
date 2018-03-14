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
                {{i18next.t('CommentCard.text.loading_comments_content')}}
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
              <template
                v-if="pluginComponents['comment.menu.top']">
                <component
                  v-for="(module, cpntName) in pluginComponents['comment.menu.top']"
                  :is="cpntName"
                  :key="cpntName"
                  :t="pluginTranslate(module)"
                  :comment="comment">
                </component>
              </template>
              <i-dropdown-item v-if="!user || !user.isAdmin" style="color: red"
                name="reportCurrentComment">
                {{i18next.t('CommentCard.btn.report_comment')}}
              </i-dropdown-item>
              <i-dropdown-item v-if="user && user.isAdmin" style="color: red"
                name="banCurrentUser">
                {{i18next.t('CommentCard.btn.ban_user')}}
              </i-dropdown-item>
              <template
                v-if="pluginComponents['comment.menu.bottom']">
                <component
                  v-for="(module, cpntName) in pluginComponents['comment.menu.bottom']"
                  :is="cpntName"
                  :key="cpntName"
                  :t="pluginTranslate(module)"
                  :comment="comment">
                </component>
              </template>
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
              {{i18next.t('CommentCard.btn.show_less_content')}}
            </template>
            <template v-else>
              <i-icon type="chevron-down"></i-icon>
              {{i18next.t('CommentCard.btn.show_full_content')}}
            </template>
          </i-button>
        </div>
        <footer class="wf-comment-footer">
          <a :title="i18next.t('CommentCard.html_title.like_comment')"
            :class="{
              'wf-inactive': likeUserIdList.indexOf(currentUserId) === -1,
              'wf-disabled': !user
            }"
            @click="toggleVote('like')">
            <span>{{likeUserIdList.length || ''}}</span>
            <i-icon type="heart"></i-icon>
          </a>
          <span class="wf-separator-v">|</span>
          <a :title="i18next.t('CommentCard.html_title.dislike_comment')"
            :class="{
              'wf-inactive': dislikeUserIdList.indexOf(currentUserId) === -1,
              'wf-disabled': !user
            }"
            @click="toggleVote('dislike')">
            <span>{{dislikeUserIdList.length || ''}}</span>
            <i-icon type="heart-broken"></i-icon>
          </a>
          <template
            v-if="pluginComponents['comment.buttons.pre']">
            <component
              v-for="(module, cpntName) in pluginComponents['comment.buttons.pre']"
              :is="cpntName"
              :key="cpntName"
              :t="pluginTranslate(module)"
              :comment="comment">
            </component>
          </template>
          <i-button
            type="text"
            class="wf-reply-btn"
            @click="toggleReplyArea">
            {{isShowingReplyArea ? i18next.t('CommentCard.btn.hide') : i18next.t('CommentCard.btn.reply')}}
          </i-button>
          <i-poptip
            confirm
            :title="i18next.t('CommentCard.confirm.deleting_comment')"
            @on-ok="confirmDelete">
            <i-button type="text" class="wf-delete-btn"
              v-if="canDelete">
              {{i18next.t('CommentCard.btn.delete')}}
            </i-button>
          </i-poptip>
          <template
            v-if="pluginComponents['comment.buttons.post']">
            <component
              v-for="(module, cpntName) in pluginComponents['comment.buttons.post']"
              :is="cpntName"
              :key="cpntName"
              :t="pluginTranslate(module)"
              :comment="comment">
            </component>
          </template>
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
            {{i18next.t('CommentCard.btn.show_more_discussion', { count: foldedDiscussionCount })}}
          </template>
          <template v-else>
            <i-icon type="chevron-up"></i-icon>
            {{i18next.t('CommentCard.btn.show_less_discussion', { count: foldedDiscussionCount })}}
          </template>
        </i-button>
      </ul>
    </section>
  </li>
</template>

<script>
import Bus from '../common/bus';
import { textContent, handleImageOnError, beforeEvent, afterEvent } from '../utils';
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
    bus: () => Bus,
    config: () => Bus.config,
    db: () => Bus.db,
    i18next: () => Bus.i18next,
    pluginComponents: () => Bus.pluginComponents,
    user: () => Bus.user,
    isCurrentUserBanned: () => Bus.isCurrentUserBanned,
    textContent: () => textContent,
    distanceInWordsToNow: () => Bus.distanceInWordsToNow,
    formatDate: () => Bus.formatDate,
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
      return btoa(this.config.pageURL);
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
    this.author.displayName = this.i18next.t('common.anonymous_user');
    this.author.photoURL = this.config.defaultAvatarURL;
    this.replyToComment.author.isAnonymous = true;
    this.replyToComment.author.displayName = this.i18next.t('common.anonymous_user');
    this.replyToComment.author.photoURL = this.config.defaultAvatarURL;

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
        this.db.ref(`users/${authorUid}`).once('value').then((snapshot) => {
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
    this.$bindAsObject('votes', this.db.ref(`votes/${this.comment.commentId}`));

    // If this comment is (1) a reply to comment, or
    // (2) a reply to a reply, get corresponding detail data.
    if (!this.isTopLevelComment) {
      this.db.ref(`comments/${this.comment.parentCommentId}`).once('value').then((snapshot) => {
        const comment = snapshot.val();
        if (!comment) {
          this.replyToComment.content = this.i18next.t('CommentCard.text.deleted_comment');
          return;
        }
        this.replyToComment.content = comment.content;
        const replyToCommentAuthorUid = comment.uid;
        if (!this.isAnonymousUser(replyToCommentAuthorUid)) {
          this.db.ref(`users/${replyToCommentAuthorUid}`).once('value').then((snapshot) => {
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
      this.db.ref('comments').orderByChild('rootCommentId').equalTo(commentId).on('child_added', (snap) => {
        const reply = snap.val();
        this.replies.push(Object.assign(reply, { commentId: this.config.databaseProvider === 'firebase' ? snap.key : snap.key() }));
      });
      this.db.ref('comments').orderByChild('rootCommentId').equalTo(commentId).on('child_removed', (snap) => {
        const key = this.config.databaseProvider === 'firebase' ? snap.key : snap.key();
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
        const title = this.i18next.t('CommentCard.html_title.image_onerror');

        imageEle.className = 'wf-error-image';
        handleImageOnError(imageEle, errorImage, title);
        this.checkShouldFold(contentEle);
      };
    }

    Bus.listenTo('OnlyOneReplyAreaShouldBeActive', activeReplyAreaId => {
      if (this.$refs.replyArea._uid !== activeReplyAreaId) {
        this.isShowingReplyArea = false;
      }
    }, this.$refs.replyArea._uid);
  },
  beforeDestroy() {
    Bus.enough('CurrentUserInfoUpdated', null, this._uid);
  },
  methods: {
    isAnonymousUser(uid) {
      const { anonymousUserId } = this.config;
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
        this.config.defaultAvatarURL,
        this.i18next.t('CommentCard.html_title.image_onerror'),
      );
    },
    toggleReplyArea() {
      this.isShowingReplyArea = !this.isShowingReplyArea;
      Bus.$emit('OnlyOneReplyAreaShouldBeActive', this.$refs.replyArea._uid);
    },
    /**
     * @param  {string='like', 'dislike'} type
     */
    toggleVote(type) {
      // if (type !=='like' && type !== 'dislikes') {
      //   return
      // }
      if (!this.user) { return; }
      if (this.isCurrentUserBanned) {
        this.$Modal.error({
          title: this.i18next.t('CommentCard.error.banned_title'),
          content: this.i18next.t('CommentCard.error.banned_content'),
          okText: this.i18next.t('CommentCard.btn.confirm'),
        });
        return;
      }

      const { uid } = this.user;
      const now = new Date();
      const { commentId } = this.comment;

      const isLiked = uid in (this.votes.likes || {});
      const isDisliked = uid in (this.votes.dislikes || {});
      const isLikeAction = (type === 'like');

      // event: beforeVoteComment
      const shouldContinue = beforeEvent('beforeVoteComment', {
        comment: this.comment,
        current: {
          isLike: isLiked,
          isDislik: isDisliked,
        },
        next: {
          isLike: !isLiked && isLikeAction,
          isDislik: !isDisliked && !isLikeAction,
        },
      }, this.bus);
      if (!shouldContinue) return;

      // event: votedComment
      const votedEventCallback = (error = null) => {
        if (error) {
          afterEvent('votedComment', { error }, this.bus);

        } else {
          afterEvent('votedComment', {
            comment: this.comment,
            last: {
              isLike: isLiked,
              isDislik: isDisliked,
            },
            current: {
              isLike: !isLiked && isLikeAction,
              isDislik: !isDisliked && !isLikeAction,
            },
          }, this.bus);
        }
      };

      if (isLikeAction) {

        if (isLiked) {
          this.db.ref(`votes/${commentId}/likes/${uid}`).remove()
            .then(() => votedEventCallback())
            .catch(error => votedEventCallback(error));
        } else {
          Promise.all([
            this.db.ref(`votes/${commentId}/likes/${uid}`).set(now.toISOString()),
            this.db.ref(`votes/${commentId}/dislikes/${uid}`).remove(),
          ]).then(() => votedEventCallback())
            .catch(error => votedEventCallback(error));
        }
      } else if (isDisliked) {
        this.db.ref(`votes/${commentId}/dislikes/${uid}`).remove()
          .then(() => votedEventCallback())
          .catch(error => votedEventCallback(error));
      } else {
        Promise.all([
          this.db.ref(`votes/${commentId}/dislikes/${uid}`).set(now.toISOString()),
          this.db.ref(`votes/${commentId}/likes/${uid}`).remove(),
        ]).then(() => votedEventCallback())
          .catch(error => votedEventCallback(error));
      }
    },
    confirmDelete() {
      // event: beforeDeleteComment
      const shouldContinue = beforeEvent('beforeDeleteComment', {
        comment: this.comment,
      }, this.bus);
      if (!shouldContinue) return;

      const { commentId } = this.comment;
      const { pageURL } = this.config;

      Promise.all([
        this.db.ref(`comments/${commentId}`).remove(),
        this.db.ref(`votes/${commentId}`).remove(),
        // Note: [todo] should move "deleting votes" outside of
        //        this batch. "votes" data shouldn't be writable
        //        by all users, because site owner cannot recover
        //        "votes" data with other unmutalbe data.
        ...(this.isTopLevelComment
          ? [
            this.db.ref(`pageComments/${pageURL}/${commentId}`).remove(),
            ...this.replies.map(reply => [
              this.db.ref(`comments/${reply.commentId}`).remove(),
              this.db.ref(`votes/${reply.commentId}`).remove(),
              this.db.ref(`pageComments/${pageURL}/${reply.commentId}`).remove(),
            ]),
          ]
          : [this.db.ref(`pageComments/${pageURL}/${commentId}`).remove()]),
      ]).then(() => {
        this.$Message.success(this.i18next.t('CommentCard.success.deleting_comment'));

        // event: deletedComment
        afterEvent('deletedComment', {
          comment: this.comment,
        }, this.bus);

      }).catch(error => {
        this.$Message.error(this.i18next.t('CommentCard.error.deleting_comment'));

        // event: deletedComment
        afterEvent('deletedComment', { error }, this.bus);
      });
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
          title: this.i18next.t('CommentCard.error.banned_title'),
          content: this.i18next.t('CommentCard.error.banned_content'),
          okText: this.i18next.t('CommentCard.btn.confirm'),
        });
        return;
      }

      // event: beforeReportComment
      const shouldContinue = beforeEvent('beforeReportComment', {
        comment: this.comment,
      }, this.bus);
      if (!shouldContinue) return;

      const now = new Date();
      this.db.ref(`reported/${this.comment.commentId}/${this.user.uid}`)
        .once('value').then((snapshot) => {
          if (snapshot.val()) {
            this.$Message.error(this.i18next.t('CommentCard.error.repeated_reporting'));
            return;
          }

          this.db.ref(`reported/${this.comment.commentId}/${this.user.uid}`).set(now.toISOString())
            .then(() => {
              this.$Message.success(this.i18next.t('CommentCard.success.reporting_comment'));

              // event: reportedComment
              afterEvent('reportedComment', { comment: this.comment }, this.bus);

            }).catch(error => {
              this.$Message.error(this.i18next.t('CommentCard.error.reporting_comment'));

              // event: reportedComment
              afterEvent('reportedComment', { error }, this.bus);
            });
        });
    },
    banCurrentUser() {
      let key;
      let type;
      const now = new Date().toISOString();
      if (this.comment.uid !== this.config.anonymousUserId) {
        key = this.comment.uid;
        type = 'uid';
      } else if (/unknow/.test(this.comment.ip)) {
        this.$Message.error(this.i18next.t('CommentCard.error.banning_user'));
        return;
      } else {
        key = this.comment.ip.replace(/\./g, '-');
        type = 'ip';
      }
      // event: beforeBanUser
      const shouldContinue = beforeEvent('beforeBanUser', {
        userKey: key,
        type,
      }, this.bus);
      if (!shouldContinue) { return; }
      this.db.ref(`ban/${key}`).once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error(this.i18next.t('CommentCard.error.repeated_banning'));
          return;
        }
        this.db.ref(`ban/${key}`).set({
          date: now,
          reason: 'comment',
        }).then(() => {
          // event: bannedUser
          afterEvent('bannedUser', {
            userKey: key,
            type,
          }, this.bus);

          this.$Message.success(this.i18next.t('CommentCard.success.banning_user'));
        }).catch((error) => {
          this.$Message.error(this.i18next.t('CommentCard.error.banning_user'));

          // event: bannedUser
          afterEvent('bannedUser', { error }, this.bus);

        });
      });
    },
    showUserInfo() {
      Bus.$emit('ShowUserInfo', {
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
