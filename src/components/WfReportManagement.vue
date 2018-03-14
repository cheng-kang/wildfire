<template>
  <i-tabs class="wf-report-management">
    <i-tab-pane
      name="reported"
      :label="i18next.t('ReportManagement.tab.reported_comments')">
      <span v-if="reportedTableData.length === 0">
        {{ i18next.t('ReportManagement.text.empty_reported_comment') }}
      </span>
      <ul class="wf-ul">
        <li class="wf-li" v-for="item in reportedTableData" :key="item.commentId">
          <div class="wf-meta">
            <i-tooltip
              placement='top'
              :transfer="true">
              <p class="wf-display-name">{{ item.author.displayName }}</p>
              <div slot="content">
                <p v-if="item.author.email">{{ item.author.email }}</p>
                <p >{{ item.comment.ip }}</p>
              </div>
            </i-tooltip>
          </div>
          <div class="wf-detail">
            <i-tooltip
              placement='top'
              :transfer="true">
              <p>
                <span>{{ getAbstract(item.comment.content) }}</span>
                <i-poptip
                  v-if="item.comment.content.length >= 20"
                  :transfer="true"
                  :showTitle="false"
                  placement='bottom'>
                  <i-button
                    type='text'
                    size='small'
                    icon="ios-search">
                    <!-- {{i18next.t('ReportManagement.btn.more')}} -->
                  </i-button>
                  <div class="wf-poptip-content" slot="content">
                    <div v-html="markdown(item.comment.content)"></div>
                  </div>
                </i-poptip>
              </p>
              <div slot="content">
                {{ i18next.t('ReportManagement.text.reported_by_n_users', { count: item.userList.length })}}
              </div>
            </i-tooltip>
          </div>
          <div class="wf-buttons">
            <i-poptip
              :confirm="true"
              :title="getBanActionTip(item.comment.uid, item.comment.ip)"
              :transfer="true"
              :okText="i18next.t('ReportManagement.btn.ban')"
              :cancelText="i18next.t('ReportManagement.btn.cancel')"
              @on-ok="banUser(item.comment.uid, item.comment.ip)" >
              <i-button
                size="small"
                type="text"
                style="color: #f90;">
                {{ i18next.t('ReportManagement.btn.ban') }}
              </i-button>
            </i-poptip>
            <i-poptip
              :confirm="true"
              :title="getDelActionTip(item.repliesCount)"
              :transfer="true"
              :okText="i18next.t('ReportManagement.btn.delete')"
              :cancelText="i18next.t('ReportManagement.btn.cancel')"
              @on-ok="deleteComment(item)">
              <i-button
                size="small"
                type="text"
                style="color: #ed3f14;">
                {{ i18next.t('ReportManagement.btn.delete') }}
              </i-button>
            </i-poptip>
            <i-poptip
              :confirm="true"
              :title="i18next.t('ReportManagement.confirm.ignoring_report')"
              :transfer="true"
              :okText="i18next.t('ReportManagement.btn.ignore')"
              :cancelText="i18next.t('ReportManagement.btn.cancel')"
              @on-ok="ignoreReported(item.commentId)">
              <i-button
                size="small"
                type="text">
                {{ i18next.t('ReportManagement.btn.ignore') }}
              </i-button>
            </i-poptip>
          </div>
        </li>
      </ul>
    </i-tab-pane>
    <i-tab-pane
      name="ban"
      :label="i18next.t('ReportManagement.tab.ban_list')">
      <span v-if="banTableData.length === 0">
        {{ i18next.t('ReportManagement.text.empty_banned_user') }}
      </span>
      <ul class="wf-ul">
        <li class="wf-li" v-for="item in banTableData" :key="item.key">
          <div class="wf-meta">
            {{distanceInWordsToNow(item.date)}}
          </div>
          <div class="wf-detail">
            <i-tooltip
              placement='top'
              :transfer="true">
              <p class="">{{ item.info }}</p>
              <div slot="content">
                <p >{{ item.displayName }}</p>
              </div>
            </i-tooltip>
          </div>
          <div class="wf-buttons">
            <i-poptip
              :confirm="true"
              :title="i18next.t('ReportManagement.confirm.unbanning_user')"
              :transfer="true"
              :okText="i18next.t('ReportManagement.btn.unban')"
              :cancelText="i18next.t('ReportManagement.btn.cancel')"
              @on-ok="unbanUser(item.key)">
              <i-button
                size="small"
                type="text">
                {{ i18next.t('ReportManagement.btn.unban') }}
              </i-button>
            </i-poptip>
          </div>
        </li>
      </ul>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Vue from 'vue';
import Bus from '../common/bus';
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
    config: () => Bus.config,
    db: () => Bus.db,
    i18next: () => Bus.i18next,
    distanceInWordsToNow: () => Bus.distanceInWordsToNow,
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
      this.db.ref('reported').on('child_added', newChild => {
        const users = newChild.val();
        const commentId = this.config.databaseProvider === 'firebase' ? newChild.key : newChild.key();
        this.db.ref(`comments/${commentId}`).once('value').then(commentSnap => {
          const comment = commentSnap.val();
          if (comment) {
            Promise.all([
              this.db.ref(`users/${comment.uid}`).once('value'),
              this.db.ref(`commentReplies/${commentId}`).once('value'),
            ]).then(snaps => {
              const user = snaps[0].val() || {
                displayName: this.i18next.t('common.unknown_user'),
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
            this.db.ref(`reported/${commentId}`).remove();
          }
        });
      });
    },
    isAnonymousUser(uid) {
      const { anonymousUserId } = this.config;
      return !uid || uid === anonymousUserId;
    },
    getBanActionTip(commentUid, commentIp) {
      if (!this.isAnonymousUser(commentUid)) {
        return this.i18next.t('ReportManagement.confirm.banning_user');
      } else if (/unknown/.test(commentIp)) {
        return this.i18next.t('ReportManagement.error.banning_user_invalid_ip');
      }
      return this.i18next.t('ReportManagement.confirm.banning_user_anonymous');

    },
    getDelActionTip(repliesCount) {
      let deleteAttr = '';
      if (repliesCount) {
        deleteAttr = this.i18next.t('ReportManagement.text.deleting_with_n_replies', { count: repliesCount });
      }
      return deleteAttr + this.i18next.t('ReportManagement.confirm.deleting_comment');
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
        this.$Message.error(this.i18next.t('ReportManagement.error.banning_user_invalid_ip'));
        return;
      } else {
        key = commentIp.replace(/\./g, '-');
      }
      this.db.ref(`ban/${key}`).once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error(this.i18next.t('ReportManagement.error.banning_user_repeated'));
          return;
        }
        this.db.ref(`ban/${key}`).set({
          date: now,
          reason: 'reported',
        }).then(() => {
          this.$Message.success(this.i18next.t('ReportManagement.success.banning_user'));
        }).catch(() => {
          this.$Message.error(this.i18next.t('ReportManagement.error.banning_user'));
        });
      });
    },
    deleteComment(item) {
      const { comment, commentId, replies } = item;
      Promise.all([
        this.db.ref(`comments/${commentId}`).remove(),
        comment.rootCommentId
          ? this.db.ref(`commentReplies/${comment.rootCommentId}/${commentId}`).remove()
          : this.db.ref(`pages/${comment.pageURL}/comments/${commentId}`).remove(),
      ]).then(() => {
        this.$Message.success(this.i18next.t('ReportManagement.success.deleting_comment'));
      }).catch(() => {
        this.$Message.error(this.i18next.t('ReportManagement.error.deleting_comment'));
      });
      if (replies.length > 0) {
        Promise.all([
          ...replies.map(replyId => this.db.ref(`comments/${replyId}`).remove()),
          this.db.ref(`commentReplies/${commentId}`).remove(),
        ]).then(() => {
          this.$Message.success(this.i18next.t('ReportManagement.success.deleting_related_replies'));
        }).catch(() => {
          this.$Message.error(this.i18next.t('ReportManagement.error.deleting_related_replies'));
        });
      }
      this.db.ref(`reported/${commentId}`).remove();
      Vue.delete(this.reportedList, commentId);
    },
    ignoreReported(commentId) {
      this.db.ref(`reported/${commentId}`).remove();
      Vue.delete(this.reportedList, commentId);
    },
    listenToBan() {
      this.banList = {};
      this.db.ref('ban').on('child_added', banItem => {
        const key = this.config.databaseProvider === 'firebase' ? banItem.key : banItem.key();
        if (/(\d{1,3}-){3}\d{1,3}/.test(key)) {
          const displayName = this.i18next.t('common.anonymous_user');
          const ip = key.replace(/-/g, '.');
          this.banList = Object.assign(
            {}, this.banList,
            { [key]: Object.assign(banItem.val(), { displayName, info: ip }) },
          );
        } else {
          const uid = key;
          this.db.ref(`users/${uid}`).once('value').then((snapshot) => {
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
      this.db.ref(`ban/${key}`)
        .remove().then(() => {
          this.$Message.info(this.i18next.t('ReportManagement.success.unbanning_user'));
          this.listenToBan();
        }).catch(() => {
          this.$Message.error(this.i18next.t('ReportManagement.error.unknown'));
        });
    },
  },
};
</script>
