<template>
  <i-tabs>
    <i-tab-pane
      name="reported"
      :label="$i18next.t('ReportManagement.tab.reported_comments')">
      <span v-if="reportedTableData.length === 0">
        {{ $i18next.t('ReportManagement.text.empty_reported_comment') }}
      </span>
      <ul class="table-list">
        <li v-for="item in reportedTableData">
          <div class="users">
            <i-tooltip
              placement='top'
              :transfer="true">
              <p claas="display-name">{{ item.author.displayName }}</p>
              <div slot="content">
                <p v-if="item.author.email">{{ item.author.email }}</p>
                <p >{{ item.comment.ip }}</p>
              </div>
            </i-tooltip>
          </div>
          <div class="content">
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
                    <!-- {{$i18next.t('ReportManagement.btn.more')}} -->
                  </i-button>
                  <div class="poptip-content" slot="content">
                    <div v-html="markdown(item.comment.content)"></div>
                  </div>
                </i-poptip>
              </p>
              <div slot="content">
                {{ $i18next.t('ReportManagement.text.reported_by_n_users', { count: item.userList.length })}}
              </div>
            </i-tooltip>
          </div>
          <div class="buttons">
            <i-poptip
              :confirm="true"
              :title="getBanActionTip(item.comment.uid, item.comment.ip)"
              :transfer="true"
              :okText="$i18next.t('ReportManagement.btn.ban')"
              :cancelText="$i18next.t('ReportManagement.btn.cancel')"
              @on-ok="banUser(item.comment.uid, item.comment.ip)" >
              <i-button
                size="small"
                type="warning">
                {{ $i18next.t('ReportManagement.btn.ban') }}
              </i-button>
            </i-poptip>
            <i-poptip
              :confirm="true"
              :title="getDelActionTip(item.repliesCount)"
              :transfer="true"
              :okText="$i18next.t('ReportManagement.btn.delete')"
              :cancelText="$i18next.t('ReportManagement.btn.cancel')"
              @on-ok="deleteComment(item)">
              <i-button
                size="small"
                type="error">
                {{ $i18next.t('ReportManagement.btn.delete') }}
              </i-button>
            </i-poptip>
            <i-poptip
              :confirm="true"
              :title="$i18next.t('ReportManagement.confirm.ignoring_report')"
              :transfer="true"
              :okText="$i18next.t('ReportManagement.btn.ignore')"
              :cancelText="$i18next.t('ReportManagement.btn.cancel')"
              @on-ok="ignoreReported(item.commentId)">
              <i-button
                size="small"
                type="text">
                {{ $i18next.t('ReportManagement.btn.ignore') }}
              </i-button>
            </i-poptip>
          </div>
        </li>
      </ul>
    </i-tab-pane>
    <i-tab-pane
      name="ban"
      :label="$i18next.t('ReportManagement.tab.ban_list')">
      <span v-if="banTableData.length === 0">
        {{ $i18next.t('ReportManagement.text.empty_banned_user') }}
      </span>
      <ul class="table-list">
        <li v-for="item in banTableData">
          <div class="meta">
            {{$moment(item.date).fromNow()}}
          </div>
          <div class="users">
            <i-tooltip
              placement='top'
              :transfer="true">
              <p claas="">{{ item.info }}</p>
              <div slot="content">
                <p >{{ item.displayName }}</p>
              </div>
            </i-tooltip>
          </div>
          <div class="buttons">
            <i-poptip
              :confirm="true"
              :title="$i18next.t('ReportManagement.confirm.unbanning_user')"
              :transfer="true"
              :okText="$i18next.t('ReportManagement.btn.unban')"
              :cancelText="$i18next.t('ReportManagement.btn.cancel')"
              @on-ok="unbanUser(item.key)">
              <i-button
                size="small"
                type="text">
                {{ $i18next.t('ReportManagement.btn.unban') }}
              </i-button>
            </i-poptip>
          </div>
        </li>
      </ul>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Vue from 'vue'
import '../assets/highlight.css'
import '../assets/highlight.dark.css'
import hljs from 'highlight.js'
import marked from 'marked'
export default {
  name: 'wf-report-management',
  data () {
    return {
      reportedList: {},
      banList: {}
    }
  },
  created () {
    this.listenToReported()
    this.listenToBan()
  },
  computed: {
    reportedTableData () {
      return Object.keys(this.reportedList).map(key => {
        return Object.assign({}, this.reportedList[key], {commentId: key})
      })
    },
    banTableData () {
      return Object.keys(this.banList).map(key => {
        return Object.assign({}, this.banList[key], { key })
      }).sort((a, b) => {
        return a.date < b.date
      })
    }
  },
  methods: {
    listenToReported () {
      this.$database.ref('reported').on('child_added', newChild => {
        const users = newChild.val()
        const commentId = this.$config.databaseProvider === 'firebase' ? newChild.key : newChild.key()
        this.$database.ref(`comments/${commentId}`).once('value').then(commentSnap => {
          const comment = commentSnap.val()
          if (comment) {
            Promise.all([
              this.$database.ref(`users/${comment.uid}`).once('value'),
              this.$database.ref(`commentReplies/${commentId}`).once('value')
            ]).then(snaps => {
              const user = snaps[0].val() || {
                displayName: this.$i18next.t('common.unknown_user'),
                email: ''
              } // Unknown user includes 1. anonymous user, and 2. deleted user.
              const replies = snaps[1].val() || {}
              this.reportedList = Object.assign({}, this.reportedList, {[commentId]: Object.assign({}, {
                userList: Object.keys(users).map(userId => {
                  return userId
                }),
                comment,
                replies: Object.keys(replies),
                repliesCount: Object.keys(replies).length,
                author: user
              })})
            })
          } else {
            // For the reported comment which has been deleted
            this.$database.ref(`reported/${commentId}`).remove()
          }
        })
      })
    },
    isAnonymousUser (uid) {
      const { anonymousUserId } = this.$config
      return !uid || uid === anonymousUserId
    },
    getBanActionTip (commentUid, commentIp) {
      if (!this.isAnonymousUser(commentUid)) {
        return this.$i18next.t('ReportManagement.confirm.banning_user')
      } else if (/unknown/.test(commentIp)) {
        return this.$i18next.t('ReportManagement.error.banning_user_invalid_ip')
      } else {
        return this.$i18next.t('ReportManagement.confirm.banning_user_anonymous')
      }
    },
    getDelActionTip (repliesCount) {
      let deleteAttr = ''
      if (repliesCount) {
        deleteAttr = this.$i18next.t('ReportManagement.text.deleting_with_n_replies', { count: repliesCount })
      }
      return deleteAttr + this.$i18next.t('ReportManagement.confirm.deleting_comment')
    },
    getAbstract (text) {
      console.log(this.banTableData)
      return text.length >= 20 ? text.slice(0, 17) + '...' : text
    },
    banUser (commentUid, commentIp) {
      let key = ''
      let now = new Date().toISOString()
      if (!this.isAnonymousUser(commentUid)) {
        key = commentUid
      } else if (/unknown/.test(commentIp)) {
        this.$Message.error(this.$i18next.t('ReportManagement.error.banning_user_invalid_ip'))
        return
      } else {
        key = commentIp.replace(/\./g, '-')
      }
      this.$database.ref(`ban/${key}`).once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.$Message.error(this.$i18next.t('ReportManagement.error.banning_user_repeated'))
          return
        }
        this.$database.ref(`ban/${key}`).set({
          date: now,
          reason: 'reported'
        }).then(() => {
          this.$Message.success(this.$i18next.t('ReportManagement.success.banning_user'))
        }).catch(() => {
          this.$Message.error(this.$i18next.t('ReportManagement.error.banning_user'))
        })
      })
    },
    deleteComment (item) {
      const { comment, commentId, replies } = item
      Promise.all([
        this.$database.ref(`comments/${commentId}`).remove(),
        comment.rootCommentId
          ? this.$database.ref(`commentReplies/${comment.rootCommentId}/${commentId}`).remove()
          : this.$database.ref(`pages/${comment.pageURL}/comments/${commentId}`).remove()
      ]).then(() => {
        this.$Message.success(this.$i18next.t('ReportManagement.success.deleting_comment'))
      }).catch(() => {
        this.$Message.error(this.$i18next.t('ReportManagement.error.deleting_comment'))
      })
      if (replies.length > 0) {
        Promise.all([
          ...replies.map(replyId => this.$database.ref(`comments/${replyId}`).remove()),
          this.$database.ref(`commentReplies/${commentId}`).remove()
        ]).then(() => {
          this.$Message.success(this.$i18next.t('ReportManagement.success.deleting_related_replies'))
        }).catch(() => {
          this.$Message.error(this.$i18next.t('ReportManagement.error.deleting_related_replies'))
        })
      }
      this.$database.ref(`reported/${commentId}`).remove()
      Vue.delete(this.reportedList, commentId)
    },
    ignoreReported (commentId) {
      this.$database.ref(`reported/${commentId}`).remove()
      Vue.delete(this.reportedList, commentId)
    },
    listenToBan () {
      this.banList = {}
      this.$database.ref(`ban`).on('child_added', banItem => {
        const key = this.$config.databaseProvider === 'firebase' ? banItem.key : banItem.key()
        if (/(\d{1,3}-){3}\d{1,3}/.test(key)) {
          const displayName = this.$i18next.t('common.anonymous_user')
          const ip = key.replace(/-/g, '.')
          this.banList = Object.assign({}, this.banList,
            {[key]: Object.assign(banItem.val(), {displayName, info: ip})})
        } else {
          const uid = key
          this.$database.ref(`users/${uid}`).once('value').then((snapshot) => {
            const {displayName, email} = snapshot.val()
            this.banList = Object.assign({}, this.banList,
              {[key]: Object.assign(banItem.val(), {displayName, info: email})})
          })
        }
      })
    },
    unbanUser (key) {
      this.$database.ref(`ban/${key}`)
        .remove().then(() => {
          this.$Message.info(this.$i18next.t('ReportManagement.success.unbanning_user'))
          this.listenToBan()
        }).catch(() => {
          this.$Message.error(this.$i18next.t('ReportManagement.error.unknown'))
        })
    },
    markdown (content) {
      var render = new marked.Renderer()
      render.link = (href, title, text) => {
        if (text.indexOf('@') === 0) {
          return `<strong>${text}[${href}]</strong>`
        } else {
          return `<a href="${href}" alt="${title}">${text}</a>`
        }
      }
      marked.setOptions({
        renderer: render,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        highlight: (code) => {
          return hljs.highlightAuto(code).value
        }
      })
      return marked(content)
    }
  }
}
</script>

<style scoped>
.table-list {
  min-height: 10vh;
  max-height: 30vh;
  overflow-y: auto;  
}
.table-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
  border-bottom: 1px dashed rgba(0,0,0,.08);
}
.table-list li div.users, .table-list li div.meta{
  line-height: 24px;
  font-size: 12px;
  margin-right: 15px;
  width: 100px;
  text-align: center;
}
.users .display-name{
  color: #444;
}
.users .email, .users .ip, .reported-by{
  color: #aaa
}
.table-list li div.content {
  flex: 1;
}
.buttons .ivu-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease-out;
  padding: 0;
}
.buttons .ivu-btn:hover {
  opacity: 1;
}
.poptip-content{
  max-height: 220px;
  max-width: 650px;
  overflow: auto;
  white-space: normal
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
