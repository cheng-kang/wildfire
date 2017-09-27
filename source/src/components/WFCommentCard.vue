<template>
  <li class="wf-comment-item" :class="{'wf-reply-item': comment.replyToCommentId}">
    <section class="comment">
      <div class="wf-comment-avatar">
        <img :src="avatarURL" :class="{ anonymous: isPostedByAnonymousUser }">
      </div>
      <div class="wf-comment-body">
        <header>
          <div class="header-content">
            <span class="username"><a href="#">{{authorUsername}}</a></span>
            <i-poptip
              v-if="comment.replyToCommentId !== undefined"
              trigger="hover"
              placement="top">
              <span class="parent-link">
                <i-icon type="forward"></i-icon>
                {{replyToCommentAuthorUsername}}
              </span>
              <div class="reply-poptip" slot="content" v-if="replyToCommentContent && replyToCommentAuthorUsername && replyToCommentAuthorPhotoURL">
                <img :src="replyToCommentAuthorPhotoURL">
                <span>
                  <span><strong>{{replyToCommentAuthorUsername}}</strong></span>
                  <span>{{this.replyToCommentContent}}</span>
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
                  name="reportCurrentComment">{{$i18next.t('button/reportThisComment')}}</i-dropdown-item>
            </i-dropdown-menu>
          </i-dropdown>
        </header>
        <div class="wf-comment-content" :class="{'code-overflow-hidden': !isShowingFullText}" :id="'wf-comment-content-'+comment['.key']">
          <div :class="{ less: isContentTooLong && !isShowingFullText }">
            <wf-marked-content :content="comment.content"></wf-marked-content>
          </div>
          <i-button type="text" 
            v-if="isContentTooLong" 
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
            @click="toggleVote('like')"
          >
            <span>{{likeUserIdList.length || ''}}</span>
            <i-icon type="heart"></i-icon>
          </a>
          <span class="separator">|</span>
          <a href="javascript:void(0)"
            :class="{
              inactive: dislikeUserIdList.indexOf(currentUserId) === -1,
              disabled: !user
            }"
            @click="toggleVote('dislike')"
          >
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
          :reply-to-comment-author-username="authorUsername"
          :reply-to-comment="commentWithDotKey"
          :page-comments-count="pageCommentsCount"
          @finishedReplying="isReplying = false">
        </wf-reply-area>
        <!-- If this is a reply (to a comment) -->
        <wf-reply-area v-if="parentComment"
          v-show="isReplying"
          :user="user"
          :reply-to-comment-author-username="authorUsername"
          :reply-to-comment="commentWithDotKey"
          :root-comment="parentCommentWithDotKey"
          :root-comment-replies-count="parentComment.repliesCount || 0"
          @finishedReplying="isReplying = false">
        </wf-reply-area>
      </div>
    </section>
    <section class="replies">
      <ul class="wf-reply-group" v-if="!comment.replyToCommentId">
        <wf-comment-card
          v-for="(reply, idx) in replies"
          v-show="!isShowingLessReplies || (isShowingLessReplies && idx < numberOfRepliesWhenShowingLess)"
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
import Bus from '../bus'

const MAX_CONTENT_HEIGHT = 180

import WfReplyArea from './WFReplyArea'
import WfMarkedContent from './WFMarkedContent'

export default {
  name: 'wf-comment-card',
  components: {
    WfReplyArea, 'wf-comment-card': this, WfMarkedContent
  },
  props: ['user', 'comment', 'pageCommentsCount', 'commentsLoadingState', 'parentComment'],
  data () {
    return {
      isHeaderMenuShowing: false,
      isReplying: false,
      avatarURL: '',
      authorUsername: '',
      isContentTooLong: false,
      isShowingFullText: false,
      replyToCommentAuthorUsername: '',
      replyToCommentAuthorPhotoURL: '',
      replyToCommentContent: '',
      replies: [],
      isShowingLessReplies: true,
      numberOfRepliesWhenShowingLess: 4
    }
  },
  computed: {
    likeUserIdList () {
      return this.comment.likes === undefined ? [] : Object.keys(this.comment.likes)
    },
    dislikeUserIdList () {
      return this.comment.dislikes === undefined ? [] : Object.keys(this.comment.dislikes)
    },
    currentUserId () {
      return this.user ? this.user.uid : 'null'
    },
    anonymousUserIdPrefix () {
      return this.$config.anonymousUserIdPrefix
    },
    isPostedByAnonymousUser () {
      return this.comment.authorUid.indexOf(this.anonymousUserIdPrefix) !== -1
    },
    encodedPageURL () {
      return btoa(this.$config.pageURL)
    },
    commentWithDotKey () {
      return Object.assign({'.key': this.comment['.key']}, this.comment)
    },
    parentCommentWithDotKey () {
      return this.parentComment
        ? Object.assign({'.key': this.parentComment['.key']}, this.parentComment)
        : {}
    },
    canDelete () {
      return this.user && (this.user.uid === this.comment.authorUid || this.user.isAdmin)
    },
    showingReplies () {
      return this.isShowingLessReplies ? this.replies.slice(0, 4) : this.replies
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
    // data initialization
    this.avatarURL = this.$config.defaultAvatarURL
    this.authorUsername = this.$i18next.t('text/anonymousUser')
    this.replyToCommentAuthorUsername = this.$i18next.t('text/anonymousUser')
    this.replyToCommentAuthorPhotoURL = this.$config.defaultAvatarURL

    if (!this.isPostedByAnonymousUser) {
      const authorUid = this.comment.authorUid
      if (this.user && authorUid === this.user.uid) {
        this.avatarURL = this.user.photoURL
        this.authorUsername = this.user.displayName
      } else {
        // if not anomymous user and not current user, get username & avatar from DB
        this.$database.ref(`users/${authorUid}`).once('value').then((snapshot) => {
          let author = snapshot.val()
          if (!author) { return }
          if (author.photoURL) {
            this.avatarURL = author.photoURL
          }
          if (author.displayName) {
            this.authorUsername = author.displayName
          }
        })
      }

      Bus.$on('CurrentUserInfoUpdated', updates => {
        this.authorUsername = updates['/displayName']
        this.avatarURL = updates['/photoURL']
      })
    }

    if (this.parentComment) {
      const replyToCommentId = this.comment.replyToCommentId
      const replyToCommentRef = this.parentComment['.key'] === replyToCommentId
                                  ? `/pages/${this.encodedPageURL}/comments/${replyToCommentId}`
                                  : `/pages/${this.encodedPageURL}/replies/${this.parentComment['.key']}/${replyToCommentId}`
      this.$database.ref(replyToCommentRef).once('value').then((snapshot) => {
        let comment = snapshot.val()
        this.replyToCommentContent = comment.content

        const replyToCommentAuthorUid = comment.authorUid
        if (replyToCommentAuthorUid.indexOf(this.anonymousUserIdPrefix) === -1) {
          this.$database.ref(`users/${replyToCommentAuthorUid}`).once('value').then((snapshot) => {
            let author = snapshot.val()
            if (author && author.displayName) {
              this.replyToCommentAuthorUsername = author.displayName
              this.replyToCommentAuthorPhotoURL = author.photoURL
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
    const contentEle = document.getElementById('wf-comment-content-' + this.comment['.key'])
    const contentEleHeight = parseInt(window.getComputedStyle(contentEle).height)
    this.isContentTooLong = (contentEleHeight > MAX_CONTENT_HEIGHT)
    this.isShowingFullText = false
  },
  methods: {
    /**
     * @param  {string='like', 'dislike'} type
     */
    toggleVote (type) {
      if (!this.user) { return }
      const { uid } = this.user

      const commentId = this.comment['.key']
      const parentCommentId = this.parentComment ? this.parentComment['.key'] : null
      const baseRef = `/pages/${this.encodedPageURL}`

      const ref = baseRef + (parentCommentId
        ? `/replies/${parentCommentId}/${commentId}/${type}s/${uid}`
        : `/comments/${commentId}/${type}s/${uid}`)

      const oppositeType = type === 'like' ? 'dislike' : 'like'
      const removeOppositeVoteRef = baseRef + (parentCommentId
        ? `/replies/${parentCommentId}/${commentId}/${oppositeType}s/${uid}`
        : `/comments/${commentId}/${oppositeType}s/${uid}`)

      let updates = {}
      if (this[`${type}UserIdList`].indexOf(uid) === -1) {
        updates[ref] = (new Date()).toISOString()
        const shouldRemoveOppositeVote = this[`${oppositeType}UserIdList`].indexOf(uid) !== -1
        if (shouldRemoveOppositeVote) {
          updates[removeOppositeVoteRef] = null
        }
        this.$database.ref().update(updates)
      } else {
        this.$database.ref(ref).remove()
      }
    },
    confirmDelete () {
      if (this.parentComment) {
        const commentKey = this.parentComment['.key']
        const replyKey = this.comment['.key']
        let updates = {}
        updates[`pages/${this.encodedPageURL}/replies/${commentKey}/${replyKey}`] = null
        updates[`pages/${this.encodedPageURL}/comments/${commentKey}/repliesCount`] = this.newRepliesCount
        this.$database.ref().update(updates)
      } else {
        const commentKey = this.comment['.key']
        let updates = {}
        updates[`pages/${this.encodedPageURL}/replies/${commentKey}`] = null
        updates[`pages/${this.encodedPageURL}/comments/${commentKey}`] = null
        updates[`pages/${this.encodedPageURL}/commentsCount`] = this.newCommentsCount
        this.$database.ref().update(updates)
      }
    },
    objectWithDotKey (obj, key) {
      return Object.assign({}, obj, {'.key': key})
    },
    handleDropdownClick (name) {
      this[name]()
    },
    reportCurrentComment () {
      if (!this.user) { return }
      this.$database.ref(`reportedComments`).push({
        date: (new Date()).toISOString(),
        commentId: this.isReply ? null : this.comment['.key'],
        replyId: this.isReply ? this.comment['.key'] : null,
        page: this.encodedPageURL,
        byUid: this.user.uid
      }).then(() => {
        this.$Message.success(this.$i18next.t('message/reportCommentSucceeded'))
      }).catch(err => {
        this.$Message.error(this.$i18next.t('message/reportCommentFailed'))
        console.log(err)
      })
    }
  }
}
</script>



<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.wf-reply-item .wf-comment-avatar img {
  width: 36px;
  height: 36px;
}
.wf-comment-item {
  display: flex;
  flex-direction: column;
}
.wf-comment-item section {
  display: flex;
  flex-direction: row;
}
.wf-comment-item section.replies {
  margin-top: 5px;
  margin-left: 60px;
}
.wf-comment-item section.replies ul {
  width: 100%;
}

.reply-poptip {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.reply-poptip img {
  width: 30px;
  height: 30px;
}

.reply-poptip>span {
  display: flex;
  flex-direction: column;
}

.reply-poptip span span {
  max-width: 120px;
  overflow: auto;
  text-overflow: ellipsis;
}

.drowdown-menu-button {
  opacity: 0;
}

.wf-comment-item section.comment:hover .drowdown-menu-button {
  opacity: 1;
}

.wf-comment-avatar {
  margin-right: 12px;
}

.wf-comment-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}

.wf-comment-body {
  position: relative;
  flex: 1;
  line-height: 21px;
}

.wf-comment-body header {
  display: flex;
  justify-content: space-between;
  color: #656c7a;
}

.wf-comment-body header .header-content .username a {
  font-size: 13px;
  font-weight: 700;
  color: rgba(40, 140, 228, 0.85);
  text-decoration: none;
}

.wf-comment-body header .header-content .username a:hover {
  color: #288ce4;
}

.wf-comment-body header .header-content .meta {
  font-size: 12px;
}

.wf-comment-body header .header-content .parent-link {
  font-size: 12px;
}

.wf-comment-body header .header-content .parent-link:hover {
  color: black;
}

.wf-comment-content {
  padding-bottom: 3px;
}

.less {
  height: 180px;
  overflow: hidden;
  margin-bottom: 10px;
}

footer {
  display: flex;
  align-items: center;

  font-size: 13px;
}

footer .like-count,.dislike-count {
  color: rgba(237, 63, 20, 0.8);
}

footer .separator {
  font-weight: 500;
  color: #e7e9ee;
  margin: 0 6px;
}

footer a {
  color: rgba(237, 63, 20, 0.8);
  font-weight: 500;

  text-decoration: none;
}

footer a:hover {
  color: #ed3f14;
}

footer .inactive {
  filter: grayscale(100%);
  color: #929292;
}

footer .disabled {
  cursor: not-allowed;
}

.wf-reply-button {
  margin-left: 12px;
}
.wf-delete-button {
  color: rgba(237, 63, 20, 0.8);
}
.wf-delete-button:hover {
  color: #ed3f14;
}
.ivu-btn {
  padding: 4px;
}
</style>

<style>
.wf-comment-content pre {
  background: #f6f8fa;
  padding: 10px 20px;
  max-height: 300px;
  
  /* 60px for avatar, 20px for padding */
  max-width: calc( 39rem - 60px - 20px);
  overflow: auto;
}
.wf-comment-content img {
  max-width: 100%;
}
.code-overflow-hidden pre{
  overflow: hidden !important;
}
</style>
