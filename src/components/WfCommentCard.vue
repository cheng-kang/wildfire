<template>
  <li class="wf-comment-item" :class="{'wf-reply-item': !isTopLevelComment}">
    <section class="comment">
      <div class="wf-comment-avatar">
        <img :src="author.photoURL" :class="{ anonymous: isPostedByAnonymousUser }">
      </div>
      <div class="wf-comment-body">
        <header>
          <div class="header-content">
            <a class="username" :title="author.displayName" @click="showUserInfo">{{shortenedUsername(author.displayName)}}</a>
            <i-poptip
              v-if="!isTopLevelComment"
              trigger="hover"
              placement="top">
              <span class="parent-link">
                <i-icon type="forward"></i-icon>
                {{shortenedUsername(replyToComment.author.displayName)}}
              </span>
              <div
                v-if="replyToComment.content &&
                      replyToComment.author.displayName &&
                      replyToComment.author.photoURL"
                slot="content"
                class="reply-poptip">
                <img :src="replyToComment.author.photoURL">
                <div>
                  <span :title="replyToComment.author.displayName">
                    <strong>{{replyToComment.author.displayName}}</strong>
                  </span>
                  <span :title="replyToComment.content">{{replyToComment.content}}</span>
                </div>
              </div>
              <div slot="content" v-else>
                {{$i18next.t('CommentCard.text.loading_comments_content')}}
              </div>
            </i-poptip>
            <span class="meta">
              <i-poptip
                :content="$moment(comment.date).format('YYYY-MM-DD h:mm:ss')"
                trigger="hover"
                placement="right">
              · {{$moment(comment.date).fromNow()}}
              </i-poptip>
            </span>
          </div>
          <i-dropdown v-if="this.user"
            trigger="click"
            placement="bottom-end"
            @on-click="handleDropdownClick">
            <a href="javascript:void(0)" class="drowdown-menu-button">
              <i-icon type="arrow-down-b"></i-icon>
            </a>
            <i-dropdown-menu slot="list">
              <i-dropdown-item v-if="!user || !user.isAdmin" style="color: red"
                name="reportCurrentComment">
                {{$i18next.t('CommentCard.btn.report_comment')}}
              </i-dropdown-item>
              <i-dropdown-item v-if="user && user.isAdmin" style="color: red"
                name="banCurrentUser">
                {{$i18next.t('CommentCard.btn.ban_user')}}
              </i-dropdown-item>
            </i-dropdown-menu>
          </i-dropdown>
        </header>
        <div class="wf-comment-content"
          :class="{'code-overflow-hidden': !isShowingFullText}"
          :id="'wf-comment-content-'+comment.commentId">
          <div :class="{ less: isContentTooLong && !isShowingFullText }">
            <wf-marked-content :content="comment.content"></wf-marked-content>
          </div>
          <i-button v-if="isContentTooLong"
            class="wf-toggle-content-btn"
            @click="isShowingFullText = !isShowingFullText"
            type="text" long>
            <template v-if="isShowingFullText">
              <i-icon type="chevron-up"></i-icon>
              {{$i18next.t('CommentCard.btn.show_less_text')}}
            </template>
            <template v-else>
              <i-icon type="chevron-down"></i-icon>
              {{$i18next.t('CommentCard.btn.show_full_text')}}
            </template>
          </i-button>
        </div>
        <footer>
          <a :title="$i18next.t('CommentCard.html_title.like_comment')"
            :class="{
              inactive: likeUserIdList.indexOf(currentUserId) === -1,
              disabled: !user
            }"
            @click="toggleVote('like')">
            <span>{{likeUserIdList.length || ''}}</span>
            <i-icon type="heart"></i-icon>
          </a>
          <span class="separator">|</span>
          <a :title="$i18next.t('CommentCard.html_title.dislike_comment')"
            :class="{
              inactive: dislikeUserIdList.indexOf(currentUserId) === -1,
              disabled: !user
            }"
            @click="toggleVote('dislike')">
            <span>{{dislikeUserIdList.length || ''}}</span>
            <i-icon type="heart-broken"></i-icon>
          </a>
          <i-button
            type="text"
            class="wf-reply-button"
            @click="toggleReplyArea"
            v-if="commentsLoadingState === 'finished'">
            {{isShowingReplyArea ? $i18next.t('CommentCard.btn.hide') : $i18next.t('CommentCard.btn.reply')}}
          </i-button>
          <i-poptip
            confirm
            :title="$i18next.t('CommentCard.confirm.deleting_comment')"
            @on-ok="confirmDelete">
            <i-button type="text" class="wf-delete-button"
              v-if="canDelete">
              {{$i18next.t('CommentCard.btn.delete')}}
            </i-button>
          </i-poptip>
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
    <section class="replies">
      <ul class="wf-reply-group" v-if="isTopLevelComment">
        <wf-comment-card
          v-for="(reply, idx) in replies"
          v-show="!isShowingLessReplies ||
                  (isShowingLessReplies && idx < numberOfRepliesWhenShowingLess)"
          :key="reply.commentId"
          :user="user"
          :comment="reply"
          :parent-comment="comment"
          :comments-loading-state="commentsLoadingState"
          ></wf-comment-card>
        <i-button type="text"
          v-show="replies.length > numberOfRepliesWhenShowingLess"
          @click="isShowingLessReplies = !isShowingLessReplies"
          long>
          <template v-if="isShowingLessReplies">
            <i-icon type="chevron-down"></i-icon>
            {{$i18next.t('CommentCard.btn.show_more_discussion')}}
          </template>
          <template v-else>
            <i-icon type="chevron-up"></i-icon>
            {{$i18next.t('CommentCard.btn.show_less_discussion')}}
          </template>
        </i-button>
      </ul>
    </section>
  </li>
</template>

<script>
const MAX_CONTENT_HEIGHT = 180

import Bus from '../common/bus'
import WfReplyArea from './WfReplyArea'
import WfMarkedContent from './WfMarkedContent'

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
  components: {
    WfReplyArea,
    'wf-comment-card': this,
    WfMarkedContent
  },
  props: [
    'user',
    'comment',
    'commentsLoadingState',
    'parentComment'
  ],
  data () {
    return {
      isShowingReplyArea: false,
      author: {
        displayName: '',
        photoURL: '',
        email: ''
      },
      isContentTooLong: false,
      isShowingFullText: true,
      replyToComment: {
        author: {
          displayName: '',
          photoURL: ''
        },
        content: ''
      },
      votes: {
        likes: {},
        dislikes: {}
      },
      replies: [],
      _repliesCount: 0,
      isShowingLessReplies: true,
      numberOfRepliesWhenShowingLess: 4
    }
  },
  computed: {
    $config () {
      return this.$_wf.config
    },
    $db () {
      return this.$_wf.db
    },
    $i18next () {
      return this.$_wf.i18next
    },
    $moment () {
      return this.$_wf.moment
    },
    isTopLevelComment () {
      return !this.comment.parentCommentId
    },
    likeUserIdList () {
      return this.votes.likes === undefined ? [] : Object.keys(this.votes.likes)
    },
    dislikeUserIdList () {
      return this.votes.dislikes === undefined ? [] : Object.keys(this.votes.dislikes)
    },
    currentUserId () {
      return this.user ? this.user.uid : 'null'
    },
    isPostedByAnonymousUser () {
      return this.isAnonymousUser(this.comment.uid)
    },
    encodedPageURL () {
      return btoa(this.$config.pageURL)
    },
    canDelete () {
      return this.user && (this.user.uid === this.comment.uid || this.user.isAdmin)
    }
  },
  created () {
    // Init user info as anonymous user
    this.author.displayName = this.$i18next.t('common.anonymous_user')
    this.author.photoURL = this.$config.defaultAvatarURL
    this.replyToComment.author.displayName = this.$i18next.t('common.anonymous_user')
    this.replyToComment.author.photoURL = this.$config.defaultAvatarURL

    if (!this.isPostedByAnonymousUser) {
      const authorUid = this.comment.uid
      if (this.user && authorUid === this.user.uid) {
        // If is current user, use current user info
        this.author.photoURL = this.user.photoURL
        this.author.displayName = this.user.displayName
        this.author.email = this.user.email
      } else {
        // Else (not anomymous user and not current user),
        // get username & avatar from DB
        this.$db.ref(`users/${authorUid}`).once('value').then((snapshot) => {
          let author = snapshot.val()

          /*
            Assign value only when the value exists,
            otherwise use default anonymous user info value.
           */
          if (!author) { return }

          if (author.photoURL) { this.author.photoURL = author.photoURL }
          if (author.displayName) { this.author.displayName = author.displayName }
          if (author.email) { this.author.email = author.email }
        })
      }
    }

    // Get Voting data
    this.$bindAsObject('votes', this.$db.ref(`votes/${this.comment.commentId}`))

    // If this comment is (1) a reply to comment, or
    // (2) a reply to a reply, get corresponding detail data.
    if (!this.isTopLevelComment) {
      this.$db.ref(`comments/${this.comment.parentCommentId}`).once('value').then((snapshot) => {
        let comment = snapshot.val()
        if (!comment) {
          this.replyToComment.content = this.$i18next.t('CommentCard.text.deleted_comment')
          return
        }
        this.replyToComment.content = comment.content
        const replyToCommentAuthorUid = comment.uid
        if (!this.isAnonymousUser(replyToCommentAuthorUid)) {
          this.$db.ref(`users/${replyToCommentAuthorUid}`).once('value').then((snapshot) => {
            let author = snapshot.val()
            /*
              Assign value only when the value exists,
              otherwise use default anonymous user info value.
             */
            if (!author) { return }
            if (author.displayName) { this.replyToComment.author.displayName = author.displayName }
            if (author.photoURL) { this.replyToComment.author.photoURL = author.photoURL }
          })
        }
      })
    } else {
    // If the comment is top-level comment,
    // get its replies.
      const commentId = this.comment.commentId
      this.$db.ref(`commentReplies/${commentId}`).once('value').then((snap) => {
        this._repliesCount = Object.keys(snap.val() || {}).length
        this.$db.ref(`comments`).orderByChild('rootCommentId').equalTo(commentId).on('child_added', (snap) => {
          const child = snap.val()
          this.replies.push(Object.assign(child, {commentId: this.$config.databaseProvider === 'firebase' ? snap.key : snap.key()}))
          if (this._repliesCount-- <= 0) { Bus.$data.discussionCount += 1 }
        })
      })
      this.$db.ref(`comments`).orderByChild('rootCommentId').equalTo(commentId).on('child_removed', (snap) => {
        const key = this.$config.databaseProvider === 'firebase' ? snap.key : snap.key()
        const idx = this.replies.findIndex(reply => reply.commentId === key)
        this.replies.splice(idx, 1)
        Bus.$data.discussionCount -= 1
      })
    }
  },
  mounted () {
    /*
      Calculate comment content height
      Note: If longer than MAX_CONTENT_HEIGHT, then fold.
     */
    const contentEle = document.getElementById('wf-comment-content-' + this.comment.commentId)
    const contentEleHeight = parseInt(window.getComputedStyle(contentEle).height)
    if (contentEleHeight > MAX_CONTENT_HEIGHT) {
      this.isContentTooLong = true
      this.isShowingFullText = false
    }

    /*
      `CurrentUserInfoUpdated` event observer
      Note: if this comment/reply is posted by the current
            user, update user info when recieves this event.
     */
    Bus.listenTo('CurrentUserInfoUpdated', updates => {
      if (this.user && this.comment.uid === this.user.uid) {
        this.author.displayName = updates['/displayName']
        this.author.photoURL = updates['/photoURL']
      }
    }, this._uid)

    Bus.listenTo('OnlyOneReplyAreaShouldBeActive', activeReplyAreaId => {
      if (this.$refs.replyArea._uid !== activeReplyAreaId) {
        this.isShowingReplyArea = false
      }
    }, this.$refs.replyArea._uid)
  },
  beforeDestroy () {
    Bus.enough('CurrentUserInfoUpdated', null, this._uid)
  },
  methods: {
    isAnonymousUser (uid) {
      const { anonymousUserId } = this.$config
      return !uid || uid === anonymousUserId
    },
    shortenedUsername (username) {
      if (username.length > 10) { return username.slice(0, 10) + '...' }
      return username
    },
    toggleReplyArea () {
      this.isShowingReplyArea = !this.isShowingReplyArea
      Bus.$emit('OnlyOneReplyAreaShouldBeActive', this.$refs.replyArea._uid)
    },
    /**
     * @param  {string='like', 'dislike'} type
     */
    toggleVote (type) {
      if (!this.user) { return }
      if ((this.user && this.user.isBanned) || (!this.user && this.$ip.isBanned)) {
        this.$Modal.error({
          title: this.$i18next.t('CommentCard.error.banned_title'),
          content: this.$i18next.t('CommentCard.error.banned_content'),
          okText: this.$i18next.t('CommentCard.btn.confirm')
        })
        return
      }
      const { uid } = this.user
      const now = new Date()
      const commentId = this.comment.commentId

      let likes = this.votes.likes || {}
      let dislikes = this.votes.dislikes || {}
      if (type === 'like') {
        if (uid in likes) {
          likes[uid] = null
        } else {
          likes[uid] = now.toISOString()
          dislikes[uid] = null
        }
      } else if (type === 'dislike') {
        if (uid in dislikes) {
          dislikes[uid] = null
        } else {
          dislikes[uid] = now.toISOString()
          likes[uid] = null
        }
      }

      this.$db.ref(`votes/${commentId}`).update({
        '/likes': likes,
        '/dislikes': dislikes
      })
    },
    confirmDelete () {
      const commentId = this.comment.commentId

      Promise.all([
        this.$db.ref(`comments/${commentId}`).remove(),
        this.$db.ref(`votes/${commentId}`).remove(),
        // Note: [todo] should move "deleting votes" outside of
        //        this batch. "votes" data shouldn't be writable
        //        by all users, because site owner cannot recover
        //        "votes" data with other unmutalbe data.
        ...(this.isTopLevelComment
          ? [
            this.$db.ref(`pages/${this.comment.pageURL}/comments/${commentId}`).remove(),
            this.$db.ref(`commentReplies/${commentId}`).remove(),
            ...this.replies.map(reply => this.$db.ref(`comments/${reply.commentId}`).remove())
          ]
          : [this.$db.ref(`commentReplies/${this.comment.rootCommentId}/${commentId}`).remove()])
      ]).then(() => {
        this.$Message.success(this.$i18next.t('CommentCard.success.deleting_comment'))
      }).catch(() => {
        this.$Message.error(this.$i18next.t('CommentCard.error.deleting_comment'))
      })
    },
    handleDropdownClick (name) {
      this[name]()
    },
    reportCurrentComment () {
      if (!this.user) { return }
      if ((this.user && this.user.isBanned) || (!this.user && this.$ip.isBanned)) {
        this.$Modal.error({
          title: this.$i18next.t('CommentCard.error.banned_title'),
          content: this.$i18next.t('CommentCard.error.banned_content'),
          okText: this.$i18next.t('CommentCard.btn.confirm')
        })
        return
      }

      var now = new Date()
      this.$db.ref(`reported/${this.comment.commentId}/${this.user.uid}`)
      .once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error(this.$i18next.t('CommentCard.error.repeated_reporting'))
          return
        }

        this.$db.ref(`reported/${this.comment.commentId}/${this.user.uid}`).set(now.toISOString())
        .then(() => {
          this.$Message.success(this.$i18next.t('CommentCard.success.reporting_comment'))
        }).catch(err => {
          this.$Message.error(this.$i18next.t('CommentCard.error.reporting_comment'))
          console.log(err)
        })
      })
    },
    banCurrentUser () {
      let key = ''
      let now = new Date().toISOString()
      if (this.comment.uid !== this.$config.anonymousUserId) {
        key = this.comment.uid
      } else if (/unknow/.test(this.comment.ip)) {
        this.$Message.error('屏蔽失败')
        return
      } else {
        key = this.comment.ip.replace(/\./g, '-')
      }
      this.$db.ref(`ban/${key}`).once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error('请勿重复屏蔽')
          return
        }
        this.$db.ref(`ban/${key}`).set({
          date: now,
          reason: 'comment'
        }).then(() => {
          this.$Message.success('屏蔽成功')
        }).catch(() => {
          this.$Message.error('屏蔽失败')
        })
      })
    },
    showUserInfo () {
      Bus.$emit('ShowUserInfo', {
        uid: this.comment.uid,
        displayName: this.author.displayName,
        photoURL: this.author.photoURL,
        email: this.author.email,
        ip: this.comment.ip
      })
    }
  }
}
</script>
<style>
.wf-comment-item { display: flex; flex-direction: column; }
.wf-comment-item section { display: flex; flex-direction: row; }
.wf-comment-item section.replies { margin-top: 5px; margin-left: 60px; }
.wf-comment-item section.replies ul { width: 100%; }
.reply-poptip { display: flex; flex-direction: row; align-items: center; }
.reply-poptip img { width: 30px; height: 30px; }
.reply-poptip div { display: flex; flex-direction: column; }
.reply-poptip span span { overflow: auto; max-width: 120px; text-overflow: ellipsis; }
.wf-comment-item .drowdown-menu-button { opacity: 0; }
.wf-comment-item .wf-comment-item section.comment:hover .drowdown-menu-button { opacity: 1; }
.wf-comment-item .wf-comment-avatar { margin-right: 12px; }
.wf-comment-item .wf-comment-avatar img { width: 48px; height: 48px; border-radius: 4px; }
.wf-comment-item.wf-reply-item .wf-comment-avatar img { width: 36px; height: 36px; }
.wf-comment-item .wf-comment-body { line-height: 21px; position: relative; flex: 1; width: calc(100% - 60px); }
.wf-comment-item .wf-comment-body header { display: flex; color: #656c7a; justify-content: space-between; }
.wf-comment-item .wf-comment-body header .header-content a.username { font-size: 13px; font-weight: 700; text-decoration: none; color: rgba(40, 140, 228, .85); }
.wf-comment-item .wf-comment-body header .header-content a.username:hover { color: #288ce4; }
.wf-comment-item .wf-comment-body header .header-content .meta { font-size: 12px; }
.wf-comment-item .wf-comment-body header .header-content .parent-link { font-size: 12px; }
.wf-comment-item .wf-comment-body header .header-content .parent-link:hover { color: black; }
.wf-comment-item .wf-comment-content { padding-bottom: 3px; }
.wf-comment-item .less { overflow: hidden; max-height: 180px; margin-bottom: 10px; }
.wf-comment-item footer { font-size: 13px; display: flex; align-items: center; }
.wf-comment-item footer .like-count, .wf-comment-item footer .dislike-count { color: rgba(237, 63, 20, .8); }
.wf-comment-item footer .separator { font-weight: 500; margin: 0 6px; color: #e7e9ee; }
.wf-comment-item footer a { font-weight: 500; text-decoration: none; color: rgba(237, 63, 20, .8); }
.wf-comment-item footer a:hover { color: #ed3f14; }
.wf-comment-item footer .inactive { color: #929292; filter: grayscale(100%); }
.wf-comment-item footer .disabled { cursor: not-allowed; }
.wf-comment-item .wf-reply-button { margin-left: 12px; }
.wf-comment-item .wf-delete-button { color: rgba(237, 63, 20, .8); }
.wf-comment-item .wf-delete-button:hover { color: #ed3f14; }
.wf-comment-item .ivu-btn { padding: 4px; }
</style>
