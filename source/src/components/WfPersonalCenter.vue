<template >
  <Tabs value="notification-box">
    <TabPane :label="$i18next.t('text/notification')" name="notification-box">
      <span v-if="Object.keys(notifications).length === 0">{{$i18next.t('notif/noNotification')}}</span>
      <div class="tips" v-else>{{$i18next.t('notif/tips')}}</div>
      <ul class="notification-list">
        <li v-for="notifId in notifIdsDESC" :class="{isRead: notifications[notifId].isRead}">
          <span class="meta">{{$moment(notifications[notifId].date).fromNow()}}</span>
          <span class="content" v-html="notifications[notifId].processedContent"></span>
          <div class="buttons">
            <i-button type="text" @click="toggleRead(notifId)">{{$i18next.t(notifications[notifId].isRead ? 'button/read' : 'button/unread')}}</i-button>
            <i-button type="text" style="color: #ed3f14" @click="deleteNotif(notifId)">{{$i18next.t('button/delete')}}</i-button>
          </div>
        </li>
      </ul>
    </TabPane>
    <TabPane :label="$i18next.t('text/history')" name="history">
    </TabPane>
  </Tabs>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'wf-personal-center',
  props: ['user'],
  data () {
    return {
      notifications: {},
      processedNotifContents: {}
    }
  },
  computed: {
    notifIdsDESC () {
      return Object.keys(this.notifications).reverse()
    }
  },
  created () {
    const uid = this.user.uid

    this.$database.ref(`notifications`).orderByChild('uid').equalTo(uid)
    .on('child_added', newNotifSnap => {
      const newNotif = newNotifSnap.val()
      const newNotifId = this.$config.databaseProvider === 'firebase' ? newNotifSnap.key : newNotifSnap.key()

      const { type, pageURL, pageTitle, commentId, content = this.$i18next.t('notif/notificationDoesntExist') } = newNotif
      const encodedPageURL = atob(pageURL)
      let processedContent
      if (type === 'c') {
        processedContent = this.$i18next.t('notif/newCommentOnPage', { pageTitle, pageURL: encodedPageURL })
        processedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
      } else if (type === 'r') {
        processedContent = this.$i18next.t('notif/newReplyToComment')
        processedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
      } else if (type === 'd') {
        processedContent = this.$i18next.t('notif/newDiscussionInComment')
        processedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
      } else if (type === 'm') {
        processedContent = this.$i18next.t('notif/newMention')
        processedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
      } else {
        processedContent = content
        processedContent += pageURL ? this.$i18next.t('notif/details', { pageURL: encodedPageURL }) : ''
      }
      Object.assign(newNotif, { processedContent })
      this.notifications = Object.assign({}, this.notifications, { [newNotifId]: newNotif })

      this.$database.ref(`comments/${commentId}`).once('value').then(commentSnap => {
        const comment = commentSnap.val()
        // When comment is deleted
        if (!comment) {
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: this.$i18next.t('notif/relatedContentNoLongerExists') })
          return
        }
        this.$database.ref(`users/${comment.uid}`).once('value').then(userSnap => {
          let commentAuthor = userSnap.val()
          if (!commentAuthor) {
            commentAuthor = {
              email: this.$i18next.t('text/anonymousUser'),
              displayName: this.$i18next.t('text/anonymousUser')
            }
          }
          let updatedContent
          if (type === 'c') {
            updatedContent = this.$i18next.t('notif/newCommentOnPage+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content,
              pageTitle,
              pageURL: encodedPageURL
            })
            updatedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
          } else if (type === 'r') {
            updatedContent = this.$i18next.t('notif/newReplyToComment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
            updatedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
          } else if (type === 'd') {
            updatedContent = this.$i18next.t('notif/newDiscussionInComment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
            updatedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
          } else if (type === 'm') {
            updatedContent = this.$i18next.t('notif/newMention+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
            updatedContent += this.$i18next.t('notif/details', { pageURL: encodedPageURL })
          }
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: updatedContent })
        })
      })
    })
  },
  methods: {
    deleteNotif (notifId) {
      Vue.delete(this.notifications, notifId)
      this.$database.ref(`notifications/${notifId}`).remove()
    },
    toggleRead (notifId) {
      const newValue = !this.notifications[notifId].isRead
      this.$database.ref(`notifications/${notifId}`).update({isRead: newValue})
      this.notifications[notifId] = Object.assign({}, this.notifications[notifId], { isRead: newValue })
    }
  }
}
</script>

<style scoped>
.tips {
  padding: 0 16px 8px 16px;
  font-size: 0.7em;
  color: #656c7a;
  text-align: left;
}
.notification-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding: 0 16px;
}
.notification-list li span.meta {
  line-height: 2em;
  font-size: 0.8em;
  margin-right: 16px;
  color: #656c7a;
  min-width: 60px;
  text-align: left;
}
.notification-list li span.content {
  flex: 1;
  text-align: left;
}
.buttons .ivu-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease-out;
  padding: 0;
}
.buttons .ivu-btn:hover {
  opacity: 1;
}
.isRead {
  opacity: 0.5;
}

/* If smaller than or equal to iPhone 6 size */
@media only screen 
  and (max-device-width: 375px) 
  and (-webkit-min-device-pixel-ratio: 2) { 
  /* display buttons vertically */
  .buttons {
    display: flex;
    flex-direction: column;
  }
}
</style>
