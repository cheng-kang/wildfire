<template>
  <i-tabs>
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
      :label="$i18next.t('ReportManagement.tab.ban_list')">
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
    const _i18next = this.$_wf.i18next
    return {
      reportedTable: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            const { repliesCount, userList } = params.row
            const { uid: commentUid, ip: commentIp } = params.row.comment
            let deleteAttr = ''
            if (repliesCount) {
              deleteAttr = _i18next.t('ReportManagement.text.deleting_with_n_replies', { count: repliesCount })
            }
            let banTip = ''
            if (!this.isAnonymousUser(commentUid)) {
              banTip = _i18next.t('ReportManagement.confirm.banning_user')
            } else if (/unknown/.test(commentIp)) {
              banTip = _i18next.t('ReportManagement.error.banning_user_invalid_ip')
            } else {
              banTip = _i18next.t('ReportManagement.confirm.banning_user_anonymous')
            }
            return [
              h('Col', {
                props: {
                  span: 12
                }
              }, [
                h('p', `IP: ${commentIp}`),
                h('p', _i18next.t('ReportManagement.text.reported_by_n_users', { count: userList.length }))
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
                    okText: _i18next.t('ReportManagement.btn.ban'),
                    cancelText: _i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      let key = ''
                      let now = new Date().toISOString()
                      if (!this.isAnonymousUser(commentUid)) {
                        key = commentUid
                      } else if (/unknown/.test(commentIp)) {
                        this.$Message.error(_i18next.t('ReportManagement.error.banning_user_invalid_ip'))
                        return
                      } else {
                        key = commentIp.replace(/\./g, '-')
                      }
                      this.$db.ref(`ban/${key}`).once('value').then((snapshot) => {
                        if (snapshot.val()) {
                          this.$Message.error(_i18next.t('ReportManagement.error.banning_user_repeated'))
                          return
                        }
                        this.$db.ref(`ban/${key}`).set({
                          date: now,
                          reason: 'reported'
                        }).then(() => {
                          this.$Message.success(_i18next.t('ReportManagement.success.banning_user'))
                        }).catch(() => {
                          this.$Message.error(_i18next.t('ReportManagement.error.banning_user'))
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
                  }, _i18next.t('ReportManagement.btn.ban'))
                ]),
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: deleteAttr + _i18next.t('ReportManagement.confirm.deleting_comment'),
                    transfer: true,
                    okText: _i18next.t('ReportManagement.btn.delete'),
                    cancelText: _i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      const { comment, commentId, replies } = params.row
                      Promise.all([
                        this.$db.ref(`comments/${commentId}`).remove(),
                        comment.rootCommentId
                          ? this.$db.ref(`commentReplies/${comment.rootCommentId}/${commentId}`).remove()
                          : this.$db.ref(`pages/${comment.pageURL}/comments/${commentId}`).remove()
                      ]).then(() => {
                        this.$Message.success(_i18next.t('ReportManagement.success.deleting_comment'))
                      }).catch(() => {
                        this.$Message.error(_i18next.t('ReportManagement.error.deleting_comment'))
                      })
                      if (replies.length > 0) {
                        Promise.all([
                          ...replies.map(replyId => this.$db.ref(`comments/${replyId}`).remove()),
                          this.$db.ref(`commentReplies/${commentId}`).remove()
                        ]).then(() => {
                          this.$Message.success(_i18next.t('ReportManagement.success.deleting_related_replies'))
                        }).catch(() => {
                          this.$Message.error(_i18next.t('ReportManagement.error.deleting_related_replies'))
                        })
                      }
                      this.$db.ref(`reported/${commentId}`).remove()
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
                  }, _i18next.t('ReportManagement.btn.delete'))
                ]),
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: _i18next.t('ReportManagement.confirm.ignoring_report'),
                    transfer: true,
                    okText: _i18next.t('ReportManagement.btn.ignore'),
                    cancelText: _i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      const { commentId } = params.row
                      this.$db.ref(`reported/${commentId}`).remove()
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
                  }, _i18next.t('ReportManagement.btn.ignore'))
                ])
              ])
            ]
          }
        },
        {
          title: _i18next.t('ReportManagement.table.users'),
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
          title: _i18next.t('ReportManagement.table.comments'),
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
                    h('span', _i18next.t('ReportManagement.btn.more'))
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
              }, [h('p', `${_i18next.t('ReportManagement.text.reason')}${params.row.reason}`)]),
              h('Col', {
                props: {
                  span: 12
                }
              }, [
                h('Poptip', {
                  props: {
                    confirm: true,
                    title: _i18next.t('ReportManagement.confirm.unbanning_user'),
                    transfer: true,
                    okText: _i18next.t('ReportManagement.btn.unban'),
                    cancelText: _i18next.t('ReportManagement.btn.cancel')
                  },
                  on: {
                    'on-ok': () => {
                      this.$db.ref(`ban/${params.row.key}`)
                      .remove().then(() => {
                        this.$Message.info(_i18next.t('ReportManagement.success.unbanning_user'))
                        this.listenToBan()
                      }).catch(() => {
                        this.$Message.error(_i18next.t('ReportManagement.error.unknown'))
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
                  }, _i18next.t('ReportManagement.btn.unban'))
                ])
              ])
            ])
          }
        },
        {
          title: _i18next.t('ReportManagement.table.users'),
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
          title: _i18next.t('ReportManagement.table.action_time'),
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
    $config () {
      return this.$_wf.config
    },
    $db () {
      return this.$_wf.db
    },
    $i18next () {
      return this.$_wf.i18next
    },
    $moment () {
      return this.$_wf.moment
    },
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
    isAnonymousUser (uid) {
      const { anonymousUserId } = this.$config
      return !uid || uid === anonymousUserId
    },
    listenToReported () {
      this.$db.ref('reported').on('child_added', newChild => {
        const users = newChild.val()
        const commentId = this.$config.databaseProvider === 'firebase' ? newChild.key : newChild.key()
        this.$db.ref(`comments/${commentId}`).once('value').then(commentSnap => {
          const comment = commentSnap.val()
          if (comment) {
            Promise.all([
              this.$db.ref(`users/${comment.uid}`).once('value'),
              this.$db.ref(`commentReplies/${commentId}`).once('value')
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
          }
        })
      })
    },
    getAbstract (text) {
      return text.length >= 30 ? text.slice(0, 27) + '...' : text
    },
    listenToBan () {
      this.banList = {}
      this.$db.ref(`ban`).on('child_added', banItem => {
        const key = this.$config.databaseProvider === 'firebase' ? banItem.key : banItem.key()
        if (/(\d{1,3}-){3}\d{1,3}/.test(key)) {
          const displayName = this.$i18next.t('common.anonymous_user')
          const ip = key.replace(/-/g, '.')
          this.banList = Object.assign({}, this.banList,
            {[key]: Object.assign(banItem.val(), {displayName, info: ip})})
        } else {
          const uid = key
          this.$db.ref(`users/${uid}`).once('value').then((snapshot) => {
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
