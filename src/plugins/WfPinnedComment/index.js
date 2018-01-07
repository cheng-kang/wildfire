import PinnedCommentHeader from './PinnedCommentHeader'
import PinnedComment from './PinnedComment'
import PinThisComment from './PinThisComment'

/*
  options:
    - backgroundColor:
        type: String
        default: 'rgba(0, 0, 0, 0.03)'
        note: set background color for the pinned comment.
 */

export default (options = {}) => {
  return {
    name: 'WfPinnedComment',
    install: ({ registerComponent, i18n, renderAt }) => {
      i18n('en', {
        WfPinnedComment: {
          pin: 'Pin',
          pinned_comment: 'Pinned Comment',
          pin_success: 'Pinned!',
          unpin: 'Unpin',
          unpin_success: 'Unpinned!',
          error: 'Something went wrong.'
        }
      })
      i18n('zh-CN', {
        WfPinnedComment: {
          pin: '置顶',
          pinned_comment: '置顶评论',
          pin_success: '置顶成功！',
          unpin: '取消置顶',
          unpin_success: '取消置顶成功！',
          error: '置顶操作出错了。'
        }
      })

      registerComponent('pinned-comment-header', PinnedCommentHeader)
      registerComponent('pinned-comment', PinnedComment)
      registerComponent('pin-this-comment', PinThisComment)
      renderAt('comments.before', 'pinned-comment-header')
      renderAt('comments.before', 'pinned-comment')
      renderAt('comment.menu.top', 'pin-this-comment')
    },
    hooks: {
      postedComment ({ bus }) {
        bus.$Message.success('Awesome, you just posted a comment!')
      }
    },
    options: options
  }
}
