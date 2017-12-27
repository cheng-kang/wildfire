<template >
  <Tabs value="notification-box" class="wf-personal-center">
    <TabPane :label="$i18next.t('PersonalCenter.tab.notification')" name="notification-box">
      <span v-if="Object.keys(notifications).length === 0">{{$i18next.t('PersonalCenter.text.empty_notif_list')}}</span>
      <wf-tip v-else>{{$i18next.t('PersonalCenter.text.tips')}}</wf-tip>
      <ul class="notification-list">
        <li v-for="notifId in notifIdsDESC" :class="{isRead: notifications[notifId].isRead}">
          <span class="meta">{{distanceInWordsToNow(notifications[notifId].date)}}</span>
          <span class="content" v-html="notifications[notifId].processedContent"></span>
          <div class="buttons">
            <i-button type="text" @click="toggleRead(notifId)">{{$i18next.t(notifications[notifId].isRead ? 'PersonalCenter.btn.read' : 'PersonalCenter.btn.unread')}}</i-button>
            <i-button type="text" style="color: #ed3f14" @click="deleteNotif(notifId)">{{$i18next.t('PersonalCenter.btn.delete')}}</i-button>
          </div>
        </li>
      </ul>
    </TabPane>
  </Tabs>
</template>

<script>
import Vue from 'vue'
import WfTip from './WfTip'
export default {
  name: 'wf-personal-center',
  components: { WfTip },
  props: ['user'],
  data () {
    return {
      notifications: {},
      processedNotifContents: {}
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
    $b64DecodeUnicode () {
      return this.$_wf.b64DecodeUnicode
    },
    distanceInWordsToNow () {
      return this.$_wf.distanceInWordsToNow
    },
    notifIdsDESC () {
      return Object.keys(this.notifications).reverse()
    }
  },
  created () {
    const uid = this.user.uid

    this.$db.ref(`notifications`).orderByChild('uid').equalTo(uid)
    .on('child_added', newNotifSnap => {
      const newNotif = newNotifSnap.val()
      const newNotifId = this.$config.databaseProvider === 'firebase' ? newNotifSnap.key : newNotifSnap.key()

      const { type, pageURL, pageTitle, commentId, content = this.$i18next.t('PersonalCenter.text.notif_doesnt_exist') } = newNotif
      const decodedPageURL = pageURL ? this.$b64DecodeUnicode(pageURL) : null
      let processedContent
      if (type === 'c') {
        processedContent = this.$i18next.t('PersonalCenter.text.new_comment_on_page', { pageTitle, pageURL: decodedPageURL })
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
      } else if (type === 'r') {
        processedContent = this.$i18next.t('PersonalCenter.text.new_reply_to_comment')
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
      } else if (type === 'd') {
        processedContent = this.$i18next.t('PersonalCenter.text.new_disc_in_comment')
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
      } else if (type === 'm') {
        processedContent = this.$i18next.t('PersonalCenter.text.new_mention')
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
      } else {
        processedContent = content
        processedContent += pageURL
                            ? ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
                            : ''
      }
      Object.assign(newNotif, { processedContent })
      this.notifications = Object.assign({}, this.notifications, { [newNotifId]: newNotif })

      this.$db.ref(`comments/${commentId}`).once('value').then(commentSnap => {
        const comment = commentSnap.val()
        // When comment is deleted
        if (!comment) {
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: this.$i18next.t('PersonalCenter.text.related_content_no_longer_exists') })
          return
        }
        this.$db.ref(`users/${comment.uid}`).once('value').then(userSnap => {
          let commentAuthor = userSnap.val()
          if (!commentAuthor) {
            commentAuthor = {
              email: this.$i18next.t('common.anonymous_user'),
              displayName: this.$i18next.t('common.anonymous_user')
            }
          }
          let updatedContent
          if (type === 'c') {
            updatedContent = this.$i18next.t('PersonalCenter.text.new_comment_on_page+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content,
              pageTitle,
              pageURL: decodedPageURL
            })
          } else if (type === 'r') {
            updatedContent = this.$i18next.t('PersonalCenter.text.new_reply_to_comment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
          } else if (type === 'd') {
            updatedContent = this.$i18next.t('PersonalCenter.text.new_disc_in_comment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
          } else if (type === 'm') {
            updatedContent = this.$i18next.t('PersonalCenter.text.new_mention+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: comment.content
            })
          }
          updatedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.$i18next.t('PersonalCenter.text.details')}</a>`
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: updatedContent })
        })
      })
    })
  },
  methods: {
    deleteNotif (notifId) {
      Vue.delete(this.notifications, notifId)
      this.$db.ref(`notifications/${notifId}`).remove()
    },
    toggleRead (notifId) {
      const newValue = !this.notifications[notifId].isRead
      this.$db.ref(`notifications/${notifId}`).update({isRead: newValue})
      this.notifications[notifId] = Object.assign({}, this.notifications[notifId], { isRead: newValue })
    }
  }
}
</script>
