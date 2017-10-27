<template>
  <i-tabs value="reported">
    <i-tab-pane
      name="reported"
      :label="$i18next.t('ReportManagement.tab.reported_comments')">
      <i-table
        class="reported-table"
        height="300"
        :columns="reportedTable"
        :data="reportedTableData"
        :border="false"></i-table>
    </i-tab-pane>
    <i-tab-pane
      name="ban"
      :label="$i18next.t('ReportManagement.tab.ban_rules')">
      <i-table
        class="reported-table"
        height="300"
        :columns="banTable"
        :data="banTableData"
        :border="false"></i-table>
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
      reportedTable: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            var deleteAttr = ''
            if (params.row.repliesCount) {
              deleteAttr = this.$i18next.t('ReportManagement.text.deleting_with_n_replies', { count: params.row.repliesCount })
            }
            var banTip = ''
            if (params.row.comment.uid) {
              banTip = this.$i18next.t('ReportManagement.text.sure_to_ban')
            } else if (/unknow/.test(params.row.comment.ip)) {
              banTip = this.$i18next.t('ReportManagement.text.can_not_ban_this_user')
            } else {
              banTip = this.$i18next.t('ReportManagement.text.ban_this_ip')
            }
            return [
              h('Col', {
                props: {
                  span: 12
                }
              }, [
                h('p', `IP: ${params.row.comment.ip}`),
                h('p', this.$i18next.t('ReportManagement.text.reported_by_n_users', { count: params.row.userList.length }))
              ]),
              h('Col', {
                props: {
                  span: 12
                }
              }, [
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: banTip,
                    transfer: true,
                    okText: this.$i18next.t('ReportManagement.btn.ban'),
                    cancelText: this.$i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      // console.log(params.row)
                      let key = ''
                      let now = new Date().toISOString()
                      if (params.row.comment.uid) {
                        key = params.row.comment.uid
                      } else if (/unknow/.test(params.row.comment.ip)) {
                        this.$Message.error(this.$i18next.t('ReportManagement.error.ban_user'))
                        return
                      } else {
                        key = params.row.comment.ip.replace(/\./g, '-')
                      }
                      this.$database.ref(`ban/${key}`).once('value').then((snapshot) => {
                        if (snapshot.val()) {
                          this.$Message.error(this.$i18next.t('ReportManagement.error.repeated_ban'))
                          return
                        }
                        this.$database.ref(`ban/${key}`).set({
                          date: now,
                          reason: 'reported'
                        }).then(() => {
                          this.$Message.success(this.$i18next.t('ReportManagement.success.ban_user'))
                        }).catch(() => {
                          this.$Message.error(this.$i18next.t('ReportManagement.error.ban_user'))
                        })
                      })
                    },
                    'on-cancel': () => {
                      return
                    }
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'warning',
                      size: 'small'
                    },
                    style: {
                      'margin-left': '5px'
                    }
                  }, this.$i18next.t('ReportManagement.btn.ban'))
                ]),
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: deleteAttr + this.$i18next.t('ReportManagement.confirm.deleting_comment'),
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
                      this.$database.ref(`reported/${commentId}`).remove()
                      Vue.delete(this.reportedList, commentId)
                    },
                    'on-cancel': () => {
                      return
                    }
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small'
                    },
                    style: {
                      'margin-left': '5px'
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
                      this.$database.ref(`reported/${commentId}`).remove()
                      Vue.delete(this.reportedList, commentId)
                    },
                    'on-cancel': () => {
                      return
                    }
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'ghost',
                      size: 'small'
                    },
                    style: {
                      'margin-left': '5px'
                    }
                  }, this.$i18next.t('ReportManagement.btn.ignore'))
                ])
              ])
            ]
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.users'),
          key: 'author',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('p', params.row.author.displayName),
              h('p', params.row.author.email)
            ])
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.comments'),
          key: 'comment',
          ellipsis: true,
          align: 'center',
          render: (h, params) => {
            return h('div', [
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
        }
      ],
      banTable: [
        {
          type: 'expand',
          width: 50,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                'margin-right': '-50px',
                'text-align': 'center'
              }
            }, [
              h('Col', {
                props: {
                  span: 12
                }
              }, [h('p', `${this.$i18next.t('ReportManagement.text.reason')}${params.row.reason}`)]),
              h('Col', {
                props: {
                  span: 12
                }
              }, [
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: this.$i18next.t('ReportManagement.text.unban_this_user'),
                    transfer: true,
                    okText: this.$i18next.t('ReportManagement.btn.unban'),
                    cancelText: this.$i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      this.$database.ref(`ban/${params.row.key}`)
                      .remove().then(() => {
                        this.$Message.info(this.$i18next.t('ReportManagement.success.unban'))
                        this.listenToBan()
                      }).catch(() => {
                        this.$Message.error(this.$i18next.t('ReportManagement.error.unknow'))
                      })
                      // console.log(params.row)
                    },
                    'on-cancel': () => {
                      return
                    }
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'ghost',
                      size: 'small'
                    },
                    style: {
                      'margin-left': '5px'
                    }
                  }, this.$i18next.t('ReportManagement.btn.unban'))
                ])
              ])
            ])
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.users'),
          key: 'users',
          align: 'center',
          render: (h, params) => {
            return [
              h('p', params.row.displayName),
              h('p', params.row.info)
            ]
          }
        },
        {
          title: this.$i18next.t('ReportManagement.table.action_time'),
          key: 'date',
          align: 'center',
          render: (h, params) => {
            return h('p', this.$moment(params.row.date).fromNow())
          }
        }
      ],
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
                email: this.$i18next.t('common.unknown_user')
              } // Incase the user is deleted
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
          }
        })
      })
    },
    getAbstract (text) {
      return text.length >= 30 ? text.slice(0, 27) + '...' : text
    },
    listenToBan () {
      this.banList = {}
      this.$database.ref(`ban`).on('child_added', banItem => {
        const key = this.$config.databaseProvider === 'firebase' ? banItem.key : banItem.key()
        // console.log(banItem.val())
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
</style>
