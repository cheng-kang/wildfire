<template>
  <i-tabs value="reportedComments">
    <i-tab-pane
      name="reportedComments"
      :label="$i18next.t('ReportManagement.tab.reported_comments')">
      <i-table
        class="reported-table"
        height="300"
        :columns="commentsTable"
        :data="reportedCommentsTableData"
        :border="false"></i-table>
    </i-tab-pane>
    <i-tab-pane
      name="banRules"
      :label="$i18next.t('ReportManagement.tab.ban_rules')">
      <div class="form-warp">
        ban-rules
      </div>
    </i-tab-pane>
  </i-tabs>

</template>

<script>
import Vue from 'vue'
import 'highlight.js/styles/googlecode.css'
import hljs from 'highlight.js'
import marked from 'marked'
export default {
  name: 'wf-report-management',
  components: {},
  props: [],
  data () {
    return {
      commentsTable: [
        {
          title: this.$i18next.t('ReportManagement.table.users'),
          key: 'author',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', params.row.author.displayName),
              h('p', params.row.author.email),
              h('p', params.row.comment.ip)
            ])
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.comments'),
          key: 'comment',
          width: 300,
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', this.$i18next.t('ReportManagement.text.reported_by_n_users', { count: params.row.users.length })),
              h('p', {
                style: {
                  'white-space': 'normal',
                  'word-wrap': 'break-word'
                }
              }, this.getAbstract(params.row.comment.content)),
              h('Poptip', {
                props: {
                  transfer: true,
                  showTitle: false,
                  placement: 'bottom'
                }
              }, [
                h('p', [
                  h('Button', {
                    props: {
                      type: 'text',
                      size: 'small'
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'ios-search'
                      }
                    }),
                    h('span', this.$i18next.t('ReportManagement.btn.more'))
                  ])
                ]),
                h('div', {
                  slot: 'content',
                  style: {
                    'max-height': '220px',
                    'max-width': '650px',
                    'overflow': 'auto',
                    'white-space': 'normal'
                  }
                }, [
                  h('div', {
                    domProps: {
                      innerHTML: this.markdown(params.row.comment.content)
                    }
                  })
                ])
              ])
            ])
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.action'),
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            var attr = ''
            if (params.row.repliesCount) {
              attr = this.$i18next.t('ReportManagement.text.deleting_with_n_replies', { count: params.row.repliesCount })
            }
            console.log(params)
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small'
                }
              }, this.$i18next.t('ReportManagement.btn.ban')),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: attr + this.$i18next.t('ReportManagement.confirm.deleting_comment'),
                  transfer: true,
                  okText: this.$i18next.t('ReportManagement.btn.delete'),
                  cancelText: this.$i18next.t('ReportManagement.btn.cancel')
                },
                on: {
                  'on-ok': () => {
                    const { comment, commentId, replies } = params.row
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
                    this.$database.ref(`reported/comments/${commentId}`).remove()
                    Vue.delete(this.reportedComments, commentId)
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
                }, this.$i18next.t('ReportManagement.btn.delete'))
              ]),
              h('Poptip', {
                props: {
                  confirm: true,
                  title: this.$i18next.t('ReportManagement.confirm.ignoring_report'),
                  transfer: true,
                  okText: this.$i18next.t('ReportManagement.btn.ignore'),
                  cancelText: this.$i18next.t('ReportManagement.btn.cancel')
                },
                on: {
                  'on-ok': () => {
                    const { commentId } = params.row
                    this.$database.ref(`reported/comments/${commentId}`).remove()
                    Vue.delete(this.reportedComments, commentId)
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
                }, this.$i18next.t('ReportManagement.btn.ignore'))
              ])
            ])
          }
        }
      ],
      reportedComments: {}
    }
  },
  created () {
    this.listenToReported()
  },
  computed: {
    reportedCommentsTableData () {
      return Object.keys(this.reportedComments).map(key => {
        return Object.assign({}, this.reportedComments[key], {commentId: key})
      })
    }
  },
  methods: {
    listenToReported () {
      this.$database.ref('reported/comments').on('child_added', newChild => {
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
                email: this.$i18next.t('common.unknown_user')
              } // Incase the user is deleted
              const replies = snaps[1].val() || {}
              this.reportedComments = Object.assign({}, this.reportedComments, {[commentId]: Object.assign({}, {
                users: Object.keys(users).map(userId => {
                  return userId
                }),
                comment,
                replies: Object.keys(replies),
                repliesCount: Object.keys(replies).length,
                author: user
              })})
            })
          }
        })
      })
    },
    getAbstract (text) {
      return text.length >= 30 ? text.slice(0, 27) + '...' : text
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