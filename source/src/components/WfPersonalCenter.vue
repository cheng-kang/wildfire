<template >
  <Tabs value="notification-box">
    <TabPane label="系统消息" name="notification-box">
      <span v-if="Object.keys(notifications).length === 0">暂无消息</span>
      <div class="tips" v-else>*小提示：鼠标悬停在高亮文字上可查看更多内容；点击查看详情可跳转到相应网页。</div>
      <ul class="notification-list">
        <li v-for="notifId in notifIdsDESC">
          <span class="meta">{{$moment(notifications[notifId].date).fromNow()}}</span>
          <span class="content" v-html="notifications[notifId].processedContent"></span>
          <i-button class="del-btn" type="text" style="color: #ed3f14" @click="deleteNotif(notifId)">删除</i-button>
        </li>
      </ul>
    </TabPane>
    <TabPane label="历史记录" name="history">
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

      const { type, pageURL, commentId, content = '该消息不存在。' } = newNotif
      let processedContent
      if (type === 'c') {
        processedContent = `有人在你的页面添加了评论。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
      } else if (type === 'r') {
        processedContent = `有人回复了你的评论。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
      } else if (type === 'd') {
        processedContent = `有人参与了你的评论的讨论。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
      } else if (type === 'm') {
        processedContent = `有人 @ 了你。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
      } else {
        processedContent = content + (pageURL ? `<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>` : '')
      }
      Object.assign(newNotif, { processedContent })
      this.notifications = Object.assign({}, this.notifications, { [newNotifId]: newNotif })

      this.$database.ref(`comments/${commentId}`).once('value').then(commentSnap => {
        const comment = commentSnap.val()
        // When comment is deleted
        if (!comment) {
          this.notifications[newNotifId] = Object.assign({}, this.notifications[newNotifId], { processedContent: '相关内容已不存在。' })
          return
        }

        this.$database.ref(`users/${comment.uid}`).once('value').then(userSnap => {
          const commentAuthor = userSnap.val()
          let updatedContent
          if (type === 'c') {
            updatedContent = `<a title="${commentAuthor.email}">${commentAuthor.displayName}</a> 在你的页面添加了 <a title="${comment.content}">评论</a>。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
          } else if (type === 'r') {
            updatedContent = `<a title="${commentAuthor.email}">${commentAuthor.displayName}</a> 对你的评论进行了 <a title="${comment.content}">回复</a>。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
          } else if (type === 'd') {
            updatedContent = `<a title="${commentAuthor.email}">${commentAuthor.displayName}</a> 参与了你的评论的 <a title="${comment.content}">讨论</a>。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
          } else if (type === 'm') {
            updatedContent = `<a title="${commentAuthor.email}">${commentAuthor.displayName}</a> 在 <a title="${comment.content}">评论</a> 中 @ 了你。<a href="${atob(pageURL)}" target="blank"><i class="ivu-icon ivu-icon-ios-search"></i>查看详情</a>`
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
.del-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease-out;
  padding: 0 15px;
}
.del-btn:hover {
  opacity: 1;
}
</style>
