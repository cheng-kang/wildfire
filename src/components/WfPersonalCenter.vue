<template >
  <Tabs value="notification-box" class="wf-personal-center">
    <TabPane :label="t('PersonalCenter.tab.notification')" name="notification-box">
      <span v-if="Object.keys(notifications).length === 0">{{t('PersonalCenter.text.empty_notif_list')}}</span>
      <wf-footnote v-else>{{t('PersonalCenter.text.tips')}}</wf-footnote>
      <ul class="wf-ul">
        <li class="wf-li" v-for="notifId in notifIdsDESC" :key="notifId" :class="{ 'wf-is-read': notifications[notifId].isRead }">
          <span class="wf-meta">{{distanceInWordsToNow(notifications[notifId].date)}}</span>
          <span class="wf-detail" v-html="notifications[notifId].processedContent"></span>
          <div class="wf-buttons">
            <i-button type="text" @click="toggleRead(notifId)">{{t(notifications[notifId].isRead ? 'PersonalCenter.btn.read' : 'PersonalCenter.btn.unread')}}</i-button>
            <i-button type="text" style="color: #ed3f14" @click="deleteNotif(notifId)">{{t('PersonalCenter.btn.delete')}}</i-button>
          </div>
        </li>
      </ul>
    </TabPane>
  </Tabs>
</template>

<script>
import Vue from 'vue';
import { bus, butler } from '../common';
import { textContent, getKey } from '../utils';

export default {
  name: 'wf-personal-center',
  data() {
    return {
      notifications: {},
      processedNotifContents: {},
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
    b64DecodeUnicode: () => butler.b64DecodeUnicode,
    distanceInWordsToNow: () => butler.distanceInWordsToNow,
    user: () => bus.user,
    notifIdsDESC() {
      return Object.keys(this.notifications).reverse();
    },
  },
  created() {
    const { uid } = this.user;

    butler.db.ref(`notifications/${uid}`).on('child_added', newNotifSnap => {
      const newNotif = newNotifSnap.val();
      const newNotifId = getKey(newNotifSnap);

      const {
        type, pageURL, pageTitle, commentId, content = this.t('PersonalCenter.text.notif_doesnt_exist'),
      } = newNotif;
      const decodedPageURL = pageURL ? this.b64DecodeUnicode(pageURL) : null;
      let processedContent;
      if (type === 'c') {
        processedContent = this.t('PersonalCenter.text.new_comment_on_page', { pageTitle, pageURL: decodedPageURL });
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`;
      } else if (type === 'r') {
        processedContent = this.t('PersonalCenter.text.new_reply_to_comment');
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`;
      } else if (type === 'd') {
        processedContent = this.t('PersonalCenter.text.new_disc_in_comment');
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`;
      } else if (type === 'm') {
        processedContent = this.t('PersonalCenter.text.new_mention');
        processedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`;
      } else {
        processedContent = content;
        processedContent += pageURL
          ? ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`
          : '';
      }
      Object.assign(newNotif, { processedContent });
      this.notifications = Object.assign({}, this.notifications, { [newNotifId]: newNotif });

      butler.db.ref(`comments/${commentId}`).once('value').then(commentSnap => {
        const comment = commentSnap.val();
        // When comment is deleted
        if (!comment) {
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: this.t('PersonalCenter.text.related_content_no_longer_exists') });
          return;
        }
        butler.db.ref(`users/${comment.uid}`).once('value').then(userSnap => {
          let commentAuthor = userSnap.val();
          if (!commentAuthor) {
            commentAuthor = {
              email: this.t('common.anonymous_user'),
              displayName: this.t('common.anonymous_user'),
            };
          }
          let updatedContent;
          if (type === 'c') {
            updatedContent = this.t('PersonalCenter.text.new_comment_on_page+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: textContent(comment.content),
              pageTitle,
              pageURL: decodedPageURL,
            });
          } else if (type === 'r') {
            updatedContent = this.t('PersonalCenter.text.new_reply_to_comment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: textContent(comment.content),
            });
          } else if (type === 'd') {
            updatedContent = this.t('PersonalCenter.text.new_disc_in_comment+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: textContent(comment.content),
            });
          } else if (type === 'm') {
            updatedContent = this.t('PersonalCenter.text.new_mention+', {
              email: commentAuthor.email,
              displayName: commentAuthor.displayName,
              content: textContent(comment.content),
            });
          }
          updatedContent += ` <a href="${decodedPageURL}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>${this.t('PersonalCenter.text.details')}</a>`;
          this.notifications[newNotifId] = (
            Object.assign(
              {},
              this.notifications[newNotifId],
              { processedContent: updatedContent },
            )
          );
        });
      });
    }, err => {
      console.error(err);
    });
  },
  methods: {
    deleteNotif(notifId) {
      const { uid } = this.user;
      Vue.delete(this.notifications, notifId);
      butler.db.ref(`notifications/${uid}/${notifId}`).remove();
    },
    toggleRead(notifId) {
      const { uid } = this.user;
      const newValue = !this.notifications[notifId].isRead;
      butler.db.ref(`notifications/${uid}/${notifId}`).update({ isRead: newValue });
      this.notifications[notifId] = (
        Object.assign(
          {},
          this.notifications[notifId],
          { isRead: newValue },
        )
      );
    },
  },
};
</script>
