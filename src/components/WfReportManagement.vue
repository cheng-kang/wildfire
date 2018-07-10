<template>
  <i-tabs class="wf-report-management">
    <i-tab-pane
      name="reported"
      :label="t('ReportManagement.tab.reported_comments')">
      <span v-if="reportedTableData.length === 0">
        {{ t('ReportManagement.text.empty_reported_comment') }}
      </span>
      <ul class="wf-ul">
        <li class="wf-li" v-for="item in reportedTableData" :key="item.commentId">
          <div class="wf-meta">
            <i-tooltip-in-modal
              placement='top'
              :transfer="true">
              <p class="wf-display-name">{{ item.author.displayName }}</p>
              <div slot="content">
                <p v-if="item.author.email">{{ item.author.email }}</p>
                <p >{{ item.comment.ip }}</p>
              </div>
            </i-tooltip-in-modal>
          </div>
          <div class="wf-detail">
            <i-tooltip-in-modal
              placement='top'
              :transfer="true">
              <p>
                <span>{{ getAbstract(item.comment.content) }}</span>
                <i-poptip-in-modal
                  v-if="item.comment.content.length >= 20"
                  :transfer="true"
                  :showTitle="false"
                  placement='bottom'>
                  <i-button
                    type='text'
                    size='small'
                    icon="ios-search">
                    <!-- {{t('ReportManagement.btn.more')}} -->
                  </i-button>
                  <div class="wf-poptip-content" slot="content">
                    <div v-html="markdown(item.comment.content)"></div>
                  </div>
                </i-poptip-in-modal>
              </p>
              <div slot="content">
                {{ t('ReportManagement.text.reported_by_n_users', { count: item.userList.length })}}
              </div>
            </i-tooltip-in-modal>
          </div>
          <div class="wf-buttons">
            <i-poptip-in-modal
              :confirm="true"
              :title="getBanActionTip(item.comment.uid, item.comment.ip)"
              :transfer="true"
              :okText="t('ReportManagement.btn.ban')"
              :cancelText="t('ReportManagement.btn.cancel')"
              @on-ok="banUser(item.comment.uid, item.comment.ip)" >
              <i-button
                size="small"
                type="text"
                style="color: #f90;">
                {{ t('ReportManagement.btn.ban') }}
              </i-button>
            </i-poptip-in-modal>
            <i-poptip-in-modal
              :confirm="true"
              :title="getDelActionTip(item.repliesCount)"
              :transfer="true"
              :okText="t('ReportManagement.btn.delete')"
              :cancelText="t('ReportManagement.btn.cancel')"
              @on-ok="deleteComment(item)">
              <i-button
                size="small"
                type="text"
                style="color: #ed3f14;">
                {{ t('ReportManagement.btn.delete') }}
              </i-button>
            </i-poptip-in-modal>
            <i-poptip-in-modal
              :confirm="true"
              :title="t('ReportManagement.confirm.ignoring_report')"
              :transfer="true"
              :okText="t('ReportManagement.btn.ignore')"
              :cancelText="t('ReportManagement.btn.cancel')"
              @on-ok="ignoreReported(item.commentId)">
              <i-button
                size="small"
                type="text">
                {{ t('ReportManagement.btn.ignore') }}
              </i-button>
            </i-poptip-in-modal>
          </div>
        </li>
      </ul>
    </i-tab-pane>
    <i-tab-pane
      name="ban"
      :label="t('ReportManagement.tab.ban_list')">
      <span v-if="banTableData.length === 0">
        {{ t('ReportManagement.text.empty_banned_user') }}
      </span>
      <ul class="wf-ul">
        <li class="wf-li" v-for="item in banTableData" :key="item.key">
          <div class="wf-meta">
            {{distanceInWordsToNow(item.date)}}
          </div>
          <div class="wf-detail">
            <i-tooltip-in-modal
              placement='top'
              :transfer="true">
              <p class="">{{ item.info }}</p>
              <div slot="content">
                <p >{{ item.displayName }}</p>
              </div>
            </i-tooltip-in-modal>
          </div>
          <div class="wf-buttons">
            <i-poptip-in-modal
              :confirm="true"
              :title="t('ReportManagement.confirm.unbanning_user')"
              :transfer="true"
              :okText="t('ReportManagement.btn.unban')"
              :cancelText="t('ReportManagement.btn.cancel')"
              @on-ok="unbanUser(item.key)">
              <i-button
                size="small"
                type="text">
                {{ t('ReportManagement.btn.unban') }}
              </i-button>
            </i-poptip-in-modal>
          </div>
        </li>
      </ul>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Vue from 'vue';
import { butler } from '../common';
import { textContent, markdown } from '../utils';
import '../assets/highlight.css';
import '../assets/highlight.dark.css';

export default {
  name: 'wf-report-management',
  data() {
    return {
      reportedList: {},
      banList: {},
    };
  },
  created() {
    this.listenToReported();
    this.listenToBan();
  },
  computed: {
    t: () => (keys, options) => butler.i18next.t(keys, options),
    distanceInWordsToNow: () => butler.distanceInWordsToNow,
    reportedTableData() {
      return (
        Object.keys(this.reportedList)
          .map(key =>
            Object.assign(
              {},
              this.reportedList[key],
              { commentId: key },
            ))
      );
    },
    banTableData() {
      return (
        Object.keys(this.banList)
          .map(key =>
            Object.assign(
              {},
              this.banList[key], { key },
            ))
          .sort((a, b) => a.date < b.date)
      );
    },
    markdown: () => markdown,
  },
  methods: {
    listenToReported() {
      butler.db.ref('reported').on('child_added', newChild => {
        const users = newChild.val();
        const commentId = butler.config.databaseProvider === 'firebase' ? newChild.key : newChild.key();
        butler.db.ref(`comments/${commentId}`).once('value').then(commentSnap => {
          const comment = commentSnap.val();
          if (comment) {
            Promise.all([
              butler.db.ref(`users/${comment.uid}`).once('value'),
              butler.db.ref('comments').orderByChild('rootCommentId').equalTo(commentId).once('value'),
            ]).then(snaps => {
              const user = snaps[0].val() || {
                displayName: this.t('common.unknown_user'),
                email: '',
              }; // Unknown user includes 1. anonymous user, and 2. deleted user.
              const replies = snaps[1].val() || {};
              this.reportedList = Object.assign({}, this.reportedList, {
                [commentId]: Object.assign({}, {
                  userList: Object.keys(users).map(userId => userId),
                  comment,
                  replies: Object.keys(replies),
                  repliesCount: Object.keys(replies).length,
                  author: user,
                }),
              });
            });
          } else {
            // For the reported comment which has been deleted
            butler.db.ref(`reported/${commentId}`).remove();
          }
        });
      });
    },
    isAnonymousUser(uid) {
      const { anonymousUserId } = butler.config;
      return !uid || uid === anonymousUserId;
    },
    getBanActionTip(commentUid, commentIp) {
      if (!this.isAnonymousUser(commentUid)) {
        return this.t('ReportManagement.confirm.banning_user');
      } else if (/unknown/.test(commentIp)) {
        return this.t('ReportManagement.error.banning_user_invalid_ip');
      }
      return this.t('ReportManagement.confirm.banning_user_anonymous');

    },
    getDelActionTip(repliesCount) {
      let deleteAttr = '';
      if (repliesCount) {
        deleteAttr = this.t('ReportManagement.text.deleting_with_n_replies', { count: repliesCount });
      }
      return deleteAttr + this.t('ReportManagement.confirm.deleting_comment');
    },
    getAbstract(content) {
      const text = textContent(content);
      return text.length >= 20 ? `${text.slice(0, 17)}...` : text;
    },
    banUser(commentUid, commentIp) {
      let key = '';
      const now = new Date().toISOString();
      if (!this.isAnonymousUser(commentUid)) {
        key = commentUid;
      } else if (/unknown/.test(commentIp)) {
        this.$Message.error(this.t('ReportManagement.error.banning_user_invalid_ip'));
        return;
      } else {
        key = commentIp.replace(/\./g, '-');
      }
      butler.db.ref(`ban/${key}`).once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error(this.t('ReportManagement.error.banning_user_repeated'));
          return;
        }
        butler.db.ref(`ban/${key}`).set({
          date: now,
          reason: 'reported',
        }).then(() => {
          this.$Message.success(this.t('ReportManagement.success.banning_user'));
        }).catch(() => {
          this.$Message.error(this.t('ReportManagement.error.banning_user'));
        });
      });
    },
    deleteComment(item) {
      const { comment, commentId, replies } = item;

      Promise.all([
        butler.db.ref(`comments/${commentId}`).remove(),
        butler.db.ref(`votes/${commentId}`).remove(),
        // Note: [todo] should move "deleting votes" outside of
        //        this batch. "votes" data shouldn't be writable
        //        by all users, because site owner cannot recover
        //        "votes" data with other unmutalbe data.
        ...(this.isTopLevelComment
          ? [
            butler.db.ref(`pageComments/${comment.pageURL}/${commentId}`).remove(),
            ...replies.map(reply => [
              butler.db.ref(`comments/${reply.commentId}`).remove(),
              butler.db.ref(`votes/${reply.commentId}`).remove(),
              butler.db.ref(`pageComments/${comment.pageURL}/${reply.commentId}`).remove(),
            ]),
          ]
          : [butler.db.ref(`pageComments/${comment.pageURL}/${commentId}`).remove()]),
      ]).then(() => {
        this.$Message.success(this.t('ReportManagement.success.deleting_comment'));
      }).catch(() => {
        this.$Message.error(this.t('ReportManagement.error.deleting_comment'));
      });
      butler.db.ref(`reported/${commentId}`).remove();
      Vue.delete(this.reportedList, commentId);
    },
    ignoreReported(commentId) {
      butler.db.ref(`reported/${commentId}`).remove();
      Vue.delete(this.reportedList, commentId);
    },
    listenToBan() {
      this.banList = {};
      butler.db.ref('ban').on('child_added', banItem => {
        const key = butler.config.databaseProvider === 'firebase' ? banItem.key : banItem.key();
        if (/(\d{1,3}-){3}\d{1,3}/.test(key)) {
          const displayName = this.t('common.anonymous_user');
          const ip = key.replace(/-/g, '.');
          this.banList = Object.assign(
            {}, this.banList,
            { [key]: Object.assign(banItem.val(), { displayName, info: ip }) },
          );
        } else {
          const uid = key;
          butler.db.ref(`users/${uid}`).once('value').then((snapshot) => {
            const { displayName, email } = snapshot.val();
            this.banList = Object.assign(
              {}, this.banList,
              { [key]: Object.assign(banItem.val(), { displayName, info: email }) },
            );
          });
        }
      });
    },
    unbanUser(key) {
      butler.db.ref(`ban/${key}`)
        .remove().then(() => {
          this.$Message.info(this.t('ReportManagement.success.unbanning_user'));
          this.listenToBan();
        }).catch(() => {
          this.$Message.error(this.t('ReportManagement.error.unknown'));
        });
    },
  },
};
</script>
