<template>
  <li class="wf-comment-item" :class="{ reply: comment.parentId !== undefined }">
    <div class="wf-comment-avatar">
      <img :src="avatarURL">
    </div>
    <div class="wf-comment-body">
      <header>
        <div class="header-content">
          <span class="username"><a href="#">{{authorUsername}}</a></span>
          <span class="parent-link" v-if="comment.replyToAuthor !== undefined">➦ {{comment.replyToAuthor}}</span>
          <span class="meta">· {{$moment(comment.date).fromNow()}}</span>
        </div>
        <div class="header-menu">
          <span class="menu-button" 
            :class="{ active: isHeaderMenuShowing }" 
            @click="isHeaderMenuShowing = !isHeaderMenuShowing"
          >▼</span>
          <ul class="menu-dropdown" :class="{ inactive: !isHeaderMenuShowing }">
            <li>
              <a href="#">report</a>
            </li>
            <li>
              <a href="#">ban user</a>
            </li>
          </ul>
        </div>
      </header>
      <div class="wf-comment-content">{{comment.content}}</div>
      <footer>
        <span class="like-count" :class="{ inactive: (comment.likes || []).indexOf('CHENGKANG') === -1}">
          {{(comment.likes || []).length || ''}}
        </span>
        <a href="#" :class="{ inactive: (comment.likes || []).indexOf('CHENGKANG') === -1}">👍</a>
        <span class="separator"></span>
        <span class="dislike-count inactive" :class="{ inactive: (comment.dislikes || []).indexOf('CHENGKANG') === -1}">
          {{(comment.dislikes || []).length || ''}}
        </span>
        <a :class="{ inactive: (comment.dislikes || []).indexOf('CHENGKANG') === -1}" href="#">👎</a>
        <span class="bullet">·</span>
        <a class="wf-button wf-reply-button" :class="{ active: isReplying }" href="#" @click="isReplying = !isReplying">
          {{isReplying ? $i18next.t('button/cancel') : $i18next.t('button/reply')}}
        </a>
        <template v-if="user && (user.uid === comment.uid)">
          <span class="bullet">·</span>
          <a class="wf-button wf-delete-button" href="#">{{$i18next.t('button/delete')}}</a>
        </template>
      </footer>
      <wf-reply-area v-if="!parentComment"
        v-show="isReplying" 
        :user="user" 
        :reply-to-comment="comment">
      </wf-reply-area>
      <wf-reply-area v-if="!!parentComment"
        v-show="isReplying" 
        :user="user" 
        :reply-to-comment="comment"
        :root-comment="parentComment">
      </wf-reply-area>
    </div>
  </li>
</template>

<script>
export default {
  name: 'wf-comment-card',
  props: ['comment', 'parentComment', 'user'],
  data () {
    return {
      isHeaderMenuShowing: false,
      isReplying: false,
      avatarURL: window._wildfire.config.defaultAvatar,
      authorUsername: ''
    }
  },
  created () {
    this.authorUsername = this.$i18next.t('text/anonymousUser')
    const uid = this.comment.authorUid
    if (uid === window._wildfire.config.anonymousUserId) { return }

    const commentId = this.comment['.key']
    const _this = this
    window._wildfire.userApp.database().ref(`users/${uid}`).once('value').then((snapshot) => {
      let author = snapshot.val()
      if (!author) { return }
      if (author.photoURL) {
        _this.avatarURL = author.photoURL
      }
      if (author.displayName) {
        _this.authorUsername = author.displayName
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
