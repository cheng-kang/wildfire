<template>
  <li class="wf-comment-item"
    :class="{'wf-reply-item': replyToCommentId}">
    <section class="comment">
      <div class="wf-comment-avatar">
        <img :src="author.photoURL" :class="{ anonymous: isPostedByAnonymousUser }">
      </div>
      <div class="wf-comment-body">
        <header>
          <div class="header-content">
            <a class="username" :title="author.displayName" @click="showUserInfo">{{shortenedUsername(author.displayName)}}</a>
            <i-poptip
              v-if="replyToCommentId"
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
                <span>
                  <span :title="replyToComment.author.displayName"><strong>{{replyToComment.author.displayName}}</strong></span>
                  <span :title="replyToComment.content">{{replyToComment.content}}</span>
                </span>
              </div>
              <div slot="content" v-else>
                {{$i18next.t('text/loadingCommentContent')}}
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
            @on-click="handleDropdownClick">
            <a href="javascript:void(0)" class="drowdown-menu-button">
              <i-icon type="arrow-down-b"></i-icon>
            </a>
            <i-dropdown-menu slot="list">
              <i-dropdown-item style="color: red"
                name="reportCurrentComment">
                {{$i18next.t('button/reportThisComment')}}
              </i-dropdown-item>
            </i-dropdown-menu>
          </i-dropdown>
        </header>
        <div class="wf-comment-content"
          :class="{'code-overflow-hidden': !isShowingFullText}"
          :id="'wf-comment-content-'+comment['.key']">
          <div :class="{ less: isContentTooLong && !isShowingFullText }">
            <wf-marked-content :content="comment.content"></wf-marked-content>
          </div>
          <i-button v-if="isContentTooLong"
            type="text"
            @click="isShowingFullText = !isShowingFullText"
            long>
            <template v-if="isShowingFullText">
              <i-icon type="chevron-up"></i-icon>
              {{$i18next.t('button/showLessText')}}
            </template>
            <template v-else>
              <i-icon type="chevron-down"></i-icon>
              {{$i18next.t('button/showFullText')}}
            </template>
          </i-button>
        </div>
        <footer>
          <a href="javascript:void(0)"
            :class="{
              inactive: likeUserIdList.indexOf(currentUserId) === -1,
              disabled: !user
            }"
            @click="toggleVote('like')">
            <span>{{likeUserIdList.length || ''}}</span>
            <i-icon type="heart"></i-icon>
          </a>
          <span class="separator">|</span>
          <a href="javascript:void(0)"
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
            @click="isReplying = !isReplying"
            v-if="commentsLoadingState === 'finished'">
            {{isReplying ? $i18next.t('button/hide') : $i18next.t('button/reply')}}
          </i-button>
          <i-poptip
            confirm
            :title="$i18next.t('text/areYouSureToDeleteThisComment')"
            @on-ok="confirmDelete">
            <i-button type="text" class="wf-delete-button"
              v-if="canDelete">
              {{$i18next.t('button/delete')}}
            </i-button>
          </i-poptip>
        </footer>
        <!-- If this is a comment -->
        <wf-reply-area v-if="!parentComment"
          v-show="isReplying"
          :user="user"
          :reply-to-comment-author-username="author.displayName"
          :reply-to-comment="commentWithDotKey"
          :page-comments-count="pageCommentsCount"
          @finished-replying="isReplying = false"></wf-reply-area>
        <!-- If this is a reply (to a comment/reply) -->
        <wf-reply-area v-if="parentComment"
          v-show="isReplying"
          :user="user"
          :reply-to-comment-author-username="author.displayName"
          :reply-to-comment="commentWithDotKey"
          :root-comment="parentCommentWithDotKey"
          :root-comment-replies-count="parentComment.repliesCount || 0"
          @finished-replying="isReplying = false"></wf-reply-area>
      </div>
    </section>
    <section class="replies">
      <ul class="wf-reply-group" v-if="!replyToCommentId">
        <wf-comment-card
          v-for="(reply, idx) in replies"
          v-show="!isShowingLessReplies ||
                  (isShowingLessReplies && idx < numberOfRepliesWhenShowingLess)"
          :key="reply['.key']"
          :user="user"
          :comment="objectWithDotKey(reply, reply['.key'])"
          :parent-comment="comment"
          :comments-loading-state="commentsLoadingState"
          ></wf-comment-card>
        <i-button type="text"
          v-show="replies.length > numberOfRepliesWhenShowingLess"
          @click="isShowingLessReplies = !isShowingLessReplies"
          long>
          <template v-if="isShowingLessReplies">
            <i-icon type="chevron-down"></i-icon>
            {{$i18next.t('text/showMoreDiscussion')}}
          </template>
          <template v-else>
            <i-icon type="chevron-up"></i-icon>
            {{$i18next.t('text/showLessDiscussion')}}
          </template>
        </i-button>
      </ul>
    </section>
  </li>
</template>

<script>
const MAX_CONTENT_HEIGHT = 180

import Bus from '../bus'
import WfReplyArea from './WFReplyArea'
import WfMarkedContent from './WFMarkedContent'

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
    'pageCommentsCount',
    'commentsLoadingState',
    'parentComment'
  ],
  data () {
    return {
      isReplying: false,
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
      replies: [],
      isShowingLessReplies: true,
      numberOfRepliesWhenShowingLess: 4
    }
  },
  computed: {
    commentWithDotKey () {
      return Object.assign({'.key': this.comment['.key']}, this.comment)
    },
    parentCommentWithDotKey () {
      return this.parentComment
              ? Object.assign(
                  {'.key': this.parentCommentId},
                  this.parentComment
                )
              : {}
    },
    replyToCommentId () {
      return this.comment.replyToCommentId
    },
    parentCommentId () {
      return this.parentComment ? this.parentComment['.key'] : undefined
    },
    likeUserIdList () {
      return this.comment.likes === undefined ? [] : Object.keys(this.comment.likes)
    },
    dislikeUserIdList () {
      return this.comment.dislikes === undefined ? [] : Object.keys(this.comment.dislikes)
    },
    currentUserId () {
      return this.user ? this.user.uid : 'null'
    },
    isPostedByAnonymousUser () {
      return this.isAnonymousUser(this.comment.authorUid)
    },
    encodedPageURL () {
      return btoa(this.$config.pageURL)
    },
    canDelete () {
      return this.user && (this.user.uid === this.comment.authorUid || this.user.isAdmin)
    },
    newCommentsCount () {
      return (parseInt(this.pageCommentsCount) || 0) - 1
    },
    newRepliesCount () {
      return (parseInt(this.parentComment.repliesCount) || 0) - 1
    },
    isReply () {
      return !!this.parentComment
    }
  },
  created () {
    // Init user info as anonymous user
    this.author.displayName = this.$i18next.t('text/anonymousUser')
    this.author.photoURL = this.$config.defaultAvatarURL
    this.replyToComment.author.displayName = this.$i18next.t('text/anonymousUser')
    this.replyToComment.author.photoURL = this.$config.defaultAvatarURL

    if (!this.isPostedByAnonymousUser) {
      const authorUid = this.comment.authorUid
      if (this.user && authorUid === this.user.uid) {
        // If is current user, use current user info
        this.author.photoURL = this.user.photoURL
        this.author.displayName = this.user.displayName
        this.author.email = this.user.email
      } else {
        // Else (not anomymous user and not current user),
        // get username & avatar from DB
        this.$database.ref(`users/${authorUid}`).once('value').then((snapshot) => {
          let author = snapshot.val()

          /*
            Assign value only when the value exists,
            otherwise use default anonymous user info value.
           */
          if (!author) { return }

          if (author.photoURL) {
            this.author.photoURL = author.photoURL
          }
          if (author.displayName) {
            this.author.displayName = author.displayName
          }
          if (author.email) {
            this.author.email = author.email
          }
        })
      }
    }

    /*
      `CurrentUserInfoUpdated` event observer
      Note: if this comment/reply is posted by the current
            user, update user info when recieves this event.
     */
    Bus.$on('CurrentUserInfoUpdated', updates => {
      if (this.user && this.comment.authorUid === this.user.uid) {
        this.author.displayName = updates['/displayName']
        this.author.photoURL = updates['/photoURL']
      }
    })

    /*
      If this comment is a reply (second-level comment),
        1. determine if it's (1) a reply to comment, (2) a
            reply to a reply, or (3) a comment
        2. get the corresponding data asynchronously
     */
    if (this.parentComment) {
      let replyToCommentRef = ''
      if (this.parentCommentId === this.replyToCommentId) {
        replyToCommentRef = `/pages/${this.encodedPageURL}/comments/${this.replyToCommentId}`
      } else {
        replyToCommentRef = `/pages/${this.encodedPageURL}/replies/${this.parentCommentId}/${this.replyToCommentId}`
      }

      this.$database.ref(replyToCommentRef).once('value').then((snapshot) => {
        let comment = snapshot.val()
        if (!comment) {
          this.replyToComment.content = this.$i18next.t('text/commentDeleted')
          return
        }
        this.replyToComment.content = comment.content
        const replyToCommentAuthorUid = comment.authorUid
        if (!this.isAnonymousUser(replyToCommentAuthorUid)) {
          this.$database.ref(`users/${replyToCommentAuthorUid}`).once('value')
          .then((snapshot) => {
            let author = snapshot.val()
            /*
              Assign value only when the value exists,
              otherwise use default anonymous user info value.
             */
            if (!author) { return }
            if (author.displayName) {
              this.replyToComment.author.displayName = author.displayName
            }
            if (author.photoURL) {
              this.replyToComment.author.photoURL = author.photoURL
            }
          })
        }
      })
    } else {
      const commentKey = this.comment['.key']
      this.$bindAsArray('replies', this.$database.ref(`pages/${this.encodedPageURL}/replies/${commentKey}`))
    }
  },
  mounted () {
    /*
      Calculate comment content height
      Note: If longer than MAX_CONTENT_HEIGHT, then fold.
     */
    const contentEle = document.getElementById('wf-comment-content-' + this.comment['.key'])
    const contentEleHeight = parseInt(window.getComputedStyle(contentEle).height)
    if (contentEleHeight > MAX_CONTENT_HEIGHT) {
      this.isContentTooLong = true
      this.isShowingFullText = false
    }
  },
  methods: {
    objectWithDotKey (obj, key) {
      return Object.assign({}, obj, {'.key': key})
    },
    isAnonymousUser (uid) {
      return uid.indexOf(this.$config.anonymousUserIdPrefix) !== -1
    },
    shortenedUsername (username) {
      if (username.length > 10) {
        return username.slice(0, 10) + '...'
      }
      return username
    },
    /**
     * @param  {string='like', 'dislike'} type
     */
    toggleVote (type) {
      if (!this.user) { return }
      const { uid } = this.user
      const now = new Date()
      const commentId = this.comment['.key']

      let commentURL = `/pages/${this.encodedPageURL}`
      if (this.parentCommentId) {
        commentURL += `/replies/${this.parentCommentId}/${commentId}`
      } else {
        commentURL += `/comments/${commentId}`
      }

      let likes = this.comment.likes || {}
      let dislikes = this.comment.dislikes || {}
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

      this.$database.ref(commentURL).update({
        '/likes': likes,
        '/dislikes': dislikes
      })
    },
    confirmDelete () {
      let commentURL
      let countURL
      let replyURL
      if (this.parentComment) {
        const commentKey = this.parentCommentId
        const replyKey = this.comment['.key']
        commentURL = `pages/${this.encodedPageURL}/replies/${commentKey}/${replyKey}`
        countURL = `pages/${this.encodedPageURL}/comments/${commentKey}/repliesCount`
      } else {
        const commentKey = this.comment['.key']
        commentURL = `pages/${this.encodedPageURL}/comments/${commentKey}`
        countURL = `pages/${this.encodedPageURL}/commentsCount`
        if (this.comment.repliesCount) {
          replyURL = `pages/${this.encodedPageURL}/replies/${commentKey}`
        }
      }
      this.$database.ref(commentURL).remove().then(() => {
        this.$database.ref(countURL).transaction((currentCount) => {
          return (currentCount || 0) > 0 ? (currentCount || 0) - 1 : 0
        }).then(() => {
          if (replyURL) {
            this.$database.ref(replyURL).remove()
          }
          this.$Message.success(this.$i18next.t('message/deleteSucceed'))
        })
      }).catch(() => {
        this.$Message.error(this.$i18next.t('message/deleteFailed'))
      })
    },
    handleDropdownClick (name) {
      this[name]()
    },
    reportCurrentComment () {
      if (!this.user) {
        return
      }
      var now = new Date()
      this.$database.ref(`reported/comments/${this.comment['.key']}`)
      .once('value').then((snapshot) => {
        let temp = snapshot.val()
        if (temp) {
          var actionBy = temp.actionBy
          if (this.currentUserId in actionBy) {
            this.$Message.error(this.$i18next.t('message/reportRepeatError'))
          } else {
            actionBy[this.currentUserId] = now.toISOString()
            this.$database.ref(`reported/comments/${this.comment['.key']}/actionBy`)
            .update(actionBy).then(() => {
              this.$Message.success(this.$i18next.t('message/reportCommentSucceeded'))
            }).catch(err => {
              this.$Message.error(this.$i18next.t('message/reportCommentFailed'))
              console.log(err)
            })
          }
        } else {
          let actionBy = {}
          actionBy[this.currentUserId] = now.toISOString()
          const order = -1 * now.getTime()
          var comment = {
            'encodedPageURL': this.encodedPageURL,
            'commentId': this.comment['.key'],
            'content': this.comment.content,
            'date': this.comment.date
          }
          if (this.comment.replyToCommentId) {
            comment.rootCommentId = this.parentCommentId
          } else {
            comment.repliesCount = this.comment.repliesCount
          }

          var author = {
            'ip': this.comment.ip
          }
          if (this.comment.authorUid.indexOf('ANON') > -1) {
            author.isAnonymousUser = true
          } else {
            author.isAnonymousUser = false
            author.authorUid = this.comment.authorUid
            author.email = this.author.email
            author.displayName = this.author.displayName
          }

          this.$database.ref(`reported/comments/${this.comment['.key']}`).update({
            actionBy,
            order,
            comment,
            author
          }).then(() => {
            this.$Message.success(this.$i18next.t('message/reportCommentSucceeded'))
          }).catch(err => {
            this.$Message.error(this.$i18next.t('message/reportCommentFailed'))
            console.log(err)
          })
        }
      })
    },
    showUserInfo () {
      Bus.$emit('ShowUserInfo', {
        uid: this.comment.authorUid,
        displayName: this.author.displayName,
        photoURL: this.author.photoURL,
        email: this.author.email,
        ip: this.comment.ip
      })
    }
  }
}
</script>

<style scoped>
.wf-reply-item .wf-comment-avatar img { width: 36px; height: 36px; }
.wf-comment-item { display: flex; flex-direction: column; }
.wf-comment-item section { display: flex; flex-direction: row; }
.wf-comment-item section.replies { margin-top: 5px; margin-left: 60px; }
.wf-comment-item section.replies ul { width: 100%; }
.reply-poptip { display: flex; flex-direction: row; align-items: center; }
.reply-poptip img { width: 30px; height: 30px; }
.reply-poptip > span { display: flex; flex-direction: column; }
.reply-poptip span span { overflow: auto; max-width: 120px; text-overflow: ellipsis; }
.drowdown-menu-button { opacity: 0; }
.wf-comment-item section.comment:hover .drowdown-menu-button { opacity: 1; }
.wf-comment-avatar { margin-right: 12px; }
.wf-comment-avatar img { width: 48px; height: 48px; border-radius: 4px; }
.wf-comment-body { line-height: 21px; position: relative; flex: 1; }
.wf-comment-body header { display: flex; color: #656c7a; justify-content: space-between; }
.wf-comment-body header .header-content a.username { font-size: 13px; font-weight: 700; text-decoration: none; color: rgba(40, 140, 228, .85); }
.wf-comment-body header .header-content a.username:hover { color: #288ce4; }
.wf-comment-body header .header-content .meta { font-size: 12px; }
.wf-comment-body header .header-content .parent-link { font-size: 12px; }
.wf-comment-body header .header-content .parent-link:hover { color: black; }
.wf-comment-content { padding-bottom: 3px; }
.less { overflow: hidden; max-height: 180px; margin-bottom: 10px; }
footer { font-size: 13px; display: flex; align-items: center; }
footer .like-count, .dislike-count { color: rgba(237, 63, 20, .8); }
footer .separator { font-weight: 500; margin: 0 6px; color: #e7e9ee; }
footer a { font-weight: 500; text-decoration: none; color: rgba(237, 63, 20, .8); }
footer a:hover { color: #ed3f14; }
footer .inactive { color: #929292; filter: grayscale(100%); }
footer .disabled { cursor: not-allowed; }
.wf-reply-button { margin-left: 12px; }
.wf-delete-button { color: rgba(237, 63, 20, .8); }
.wf-delete-button:hover { color: #ed3f14; }
.ivu-btn { padding: 4px; }
</style>
