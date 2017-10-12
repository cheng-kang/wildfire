<style scoped>
.form-warp{
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  align-items: space-between;
  width: 80%;
  margin: auto;
  padding-top: 10px;
  padding-bottom: 30px
}
</style>
<style>
  #wildfire .reported-table .ivu-poptip-popper{
    position: absolute !important;
  }
</style>
<template>
  <i-tabs value="reportUser">
    <i-tab-pane label="被举报用户" name="reportUser" >
      <div class="form-warp">
        123
      </div>
    </i-tab-pane>
    <i-tab-pane label="被举报评论" name="reportComment" >
      <i-table height="300" :columns="commentsTable" :data="computedComments" :border="false" class="reported-table"></i-table>
    </i-tab-pane>
    <i-tab-pane label="禁用规则" name="banRules">
      <div class="form-warp">
        ban-rules
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
export default {
  name: 'wf-report-management',
  props: [],
  data () {
    return {
      commentsTable: [
        {
          title: '用户',
          key: 'account',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.account.map((item) => {
              return h('p', item)
            }))
          }
        },
        {
          title: '评论内容',
          key: 'comment',
          width: 250,
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', params.row.comment.outline),
              h('a', {
                props: {
                  type: 'text',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.showDetail(params.row.comment.content)
                  }
                }
              }, [
                h('Icon', {
                  props: {
                    type: 'ios-search'
                  }
                }),
                h('span', '查看详情')
              ])
            ])
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            var attr = ''
            if (params.row.action.delAction.repliesCount) {
              attr = '删除该评论将一并删除0条对其的回复，\n'.replace('0', params.row.action.delAction.repliesCount)
            }
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                }
              }, '封禁用户'),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: attr + `确认要删除这条评论吗？`,
                  transfer: true,
                  okText: 'OK',
                  cancelText: 'Cancel'
                },
                on: {
                  'on-ok': () => {
                    let delAction = params.row.action.delAction
                    this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.commentURL}`)
                      .remove()
                    this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.countURL}`)
                      .once('value').then((snapshot) => {
                        let count = parseInt(snapshot.val()) - 1
                        let update = {}
                        update[`pages/${delAction.encodedPageURL}/${delAction.countURL}`] = count
                        this.$database.ref().update(update)
                      })
                    if (delAction.replyURL) {
                      this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.replyURL}`)
                        .remove()
                    }
                  },
                  'on-cancel': () => {
                    return
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  }
                }, '删除评论')
              ]),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: '您确认忽略这条举报吗？',
                  transfer: true,
                  okText: 'OK',
                  cancelText: 'Cancel'
                },
                on: {
                  'on-ok': () => {
                    this.$database.ref(`reported/${params.row.action.reportURL}`).remove()
                  },
                  'on-cancel': () => {
                    return
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  }
                }, '忽略')
              ])
            ])
          }
        }
      ],
      reportedCommentsRaw: [],
      reportedUsersRaw: []
    }
  },
  created () {
    this.listenToReported()
  },
  computed: {
    computedComments () {
      var result = []
      for (var i = 0; i < this.reportedCommentsRaw.length; i++) {
        let temp = {}
        let item = this.reportedCommentsRaw[i]
        temp.account = this.parseUser(item.author)
        temp.comment = this.parseComment(item.comment)
        temp.action = this.parseAction(item)
        result.push(temp)
      }
      return result
    },
    reportedUsers () {
      return this.reportedUsersRaw.map((user) => {
        return user
      })
    }
  },
  methods: {
    listenToReported () {
      this.$bindAsArray('reportedCommentsRaw',
        this.$database.ref(`/reported/comments`).orderByChild('order'))

      this.$bindAsArray('reportedUsersRaw',
        this.$database.ref(`/reported/users`).orderByChild('order'))
    },
    parseUser (user) {
      if (user.isAnonymousUser) {
        return [this.$i18next.t('text/anonymousUser'), user.ip]
      } else {
        return [user.displayName, user.email, user.ip]
      }
    },
    parseComment (comment) {
      return {
        outline: comment.content.length >= 30
          ? comment.content.slice(0, 27) + '...' : comment.content,
        content: comment.content,
        date: comment.date
      }
    },
    parseAction (item) {
      const reportURL = `comments/${item['.key']}`

      var banAction = {
        ip: item.author.ip
      }
      if (!item.author.isAnonymousUser) {
        banAction.email = item.author.email
        banAction.authorUid = item.author.authorUid
      }

      var delAction = {
        encodedPageURL: item.comment.encodedPageURL
      }

      if (item.comment.rootCommentId) {
        delAction.encodedPageURL = item.comment.encodedPageURL
        delAction.commentURL = `replies/${item.comment.rootCommentId}/${item.comment.commentId}`
        delAction.countURL = `comments/${item.comment.rootCommentId}/repliesCount`
      } else {
        delAction.commentURL = `comments//${item.comment.commentId}`
        delAction.countURL = `comments/commentsCount`
        if (item.comment.repliesCount) {
          delAction.repliesCount = item.comment.repliesCount
          delAction.replyURL = `replies/${item.comment.commentId}`
        }
      }

      return {
        reportURL,
        banAction,
        delAction
      }
    },
    showDetail (params) {
      console.log(params)
    }
  }
}
</script>
