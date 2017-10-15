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
    <i-tab-pane :label="$i18next.t('text/reportedUsers')" name="reportUser" >
      <div class="form-warp">
        123
      </div>
    </i-tab-pane>
    <i-tab-pane :label="$i18next.t('text/reportedComments')" name="reportComment" >
      <i-table height="300" :columns="commentsTable" :data="computedComments" :border="false" class="reported-table"></i-table>
    </i-tab-pane>
    <i-tab-pane :label="$i18next.t('text/banRules')" name="banRules">
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
          title: this.$i18next.t('text/usersInfo'),
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
          title: this.$i18next.t('text/commentsContent'),
          key: 'comment',
          width: 300,
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', this.$i18next.t('text/reportedBy0Users').replace(0, params.row.comment.count)),
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
                h('span', this.$i18next.t('text/findMoreDetial'))
              ])
            ])
          }
        },
        {
          title: this.$i18next.t('text/action'),
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            var attr = ''
            if (params.row.action.delAction.repliesCount) {
              attr = this.$i18next.t('text/deleteWithAll0Replies').replace('0', params.row.action.delAction.repliesCount)
            }
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                }
              }, this.$i18next.t('button/banThisUser')),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: attr + this.$i18next.t('text/sureToDelete'),
                  transfer: true,
                  okText: this.$i18next.t('button/delete'),
                  cancelText: this.$i18next.t('button/cancel')
                },
                on: {
                  'on-ok': () => {
                    /*
                      Notice:
                        When you want to delete a reply while the root comment has
                        been deleted, it will occur a error cause the reply is null.
                        Be relaxed, it's ok with the logic.
                    */
                    let delAction = params.row.action.delAction
                    // Delete the target comment (or reply).
                    this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.commentURL}`)
                      .remove().then(() => {
                        if (delAction.replyURL) {
                          // The target is a root comment, which has some replies. Delete all of them.
                          this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.replyURL}`)
                            .remove()
                        }
                        /*
                          Change the count of comments (or replies).
                          Sometimes the root comment has been deleted, when you want to handle a reply
                          of it, it will occur a error cause the target reply is null. it's fine. Then
                          just set the root comment's repliesCount as null.
                        */
                        this.$database.ref(`pages/${delAction.encodedPageURL}/${delAction.countURL}`)
                          .transaction((currentCount) => {
                            return currentCount ? currentCount - 1 : null
                          })
                        // Finish this report by remove it.
                        this.$database.ref(`reported/${params.row.action.reportURL}`).remove()
                      })
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
                }, this.$i18next.t('button/deleteTheComment'))
              ]),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: this.$i18next.t('button/sureToIgnore'),
                  transfer: true,
                  okText: this.$i18next.t('button/delete'),
                  cancelText: this.$i18next.t('button/cancel')
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
                }, this.$i18next.t('button/ignore'))
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
        temp.comment = Object.assign({}, this.parseComment(item.comment), {
          count: Object.keys(item.actionBy).length
        })
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
        encodedPageURL: item.comment.pageURL
      }

      if (item.comment.rootCommentId) {
        // delete a reply
        delAction.encodedPageURL = item.comment.pageURL
        delAction.commentURL = `replies/${item.comment.rootCommentId}/${item.comment.commentId}`
        delAction.countURL = `comments/${item.comment.rootCommentId}/repliesCount`
      } else {
        // delete a normal comment
        delAction.commentURL = `comments/${item.comment.commentId}`
        delAction.countURL = `commentsCount`
        if (item.comment.repliesCount) {
          // delete a root comment with replies
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
