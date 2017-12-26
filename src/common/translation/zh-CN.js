export const langZhCN = {
  common: {
    add_wildfire_to_your_site: '在你的网站使用 Wildfire',
    anonymous_user: '匿名用户',
    btn: {
      cancel: '取消',
      confirm: '确认'
    },
    tip_prefix: '*小提示：',
    unknown_ip: '未知 IP 地址',
    unknown_user: '未知用户'
  },
  AdminHelpers: {
    btn: {
      reset: '重置',
      resetting: '重置中...'
    },
    confirm: {
      resetting_discussion_count_for_all_pages: '确定要重置所有页面的评论数量吗？'
    },
    error: {
      resetting_discussion_count_for_all_pages: '出错了，请稍后再试。'
    },
    success: {
      resetting_discussion_count_for_all_pages: '成功重置了所有页面的评论数量！'
    },
    tab: {
      helpers: '辅助功能'
    },
    text: {
      desc_resetting_discussion_count_for_all_pages: '如果页面的评论数量出现错误的话，你可以通过这个辅助功能重置所有页面的评论数量。',
      resetting_discussion_count_for_all_pages: '重置所有页面的评论数量'
    }
  },
  AuthForm: {
    btn: {
      cancel: '取消',
      sign_in: '登录',
      sign_up: '注册'
    },
    error: {
      email_already_in_use: '邮箱已经占用！',
      empty_confirm_pwd: '请再次输入密码。',
      empty_email: '邮箱不能为空。',
      empty_pwd: '密码不能为空。',
      invalid_email: '邮箱格式不正确。',
      invalid_form: '表单验证失败，请按要求填写！',
      operation_not_allowed: '邮箱登录被禁止，请联系站主！',
      passwords_dont_match: '两次输入的密码不一致。',
      password_min_length: '密码长度至少为 6 位。',
      weak_password: '密码安全性太弱。',
      signing_in: '登录失败，请重试！',
      signing_up: '注册失败，请重试！',
      unknown: '糟糕，出错了。'
    },
    label: {
      confirm_pwd: '确认密码',
      email: '邮箱',
      password: '密码'
    },
    placeholder: {
      confirm_pwd: '再次输入你的密码',
      email: '你的邮箱地址',
      password: '密码长度至少 6 位'
    },
    success: {
      signing_in: '登录成功！',
      signing_up: '注册成功！'
    }
  },
  Body: {
    placeholder: {
      mention_autocomplete: '你要 @ 谁？'
    },
    text: {
      loading_comments: '评论加载中',
      loading_comments_failed: '评论加载失败。',
      post_the_first_comment: '快来发布第一条评论吧！'
    }
  },
  CommentCard: {
    btn: {
      delete: '删除',
      hide: '收起',
      reply: '回复',
      confirm: '确认',
      report_comment: '举报此评论',
      ban_user: '封禁该用户',
      show_full_text: '展开全部',
      show_more_discussion: '展开更多讨论',
      show_less_discussion: '收起更多讨论',
      show_less_text: '收起'
    },
    confirm: {
      deleting_comment: '你确定要删除这条评论吗？'
    },
    error: {
      deleting_comment: '删除失败。',
      repeated_reporting: '你已经举报过这条评论。',
      reporting_comment: '举报失败，请稍后重试。',
      banned_title: '禁止操作',
      banned_content: '你当前已被站长禁言，无法操作！'
    },
    html_title: {
      dislike_comment: '踩这条评论。',
      like_comment: '给这条评论点赞！'
    },
    success: {
      deleting_comment: '删除成功。',
      reporting_comment: '评论举报成功。'
    },
    text: {
      deleted_comment: '该评论已不存在。',
      loading_comments_content: '加载评论内容中'
    }
  },
  Header: {
    btn: {
      cancel: '取消',
      comment: '条评论',
      comments: '条评论',
      confirm: '确认',
      sign_in: '登录',
      sign_out: '注销',
      sign_up: '注册'
    },
    menu: {
      actions: '更多操作',
      admin_center: '站长中心',
      admin_helpers: '辅助功能',
      more: '更多操作',
      notification: '系统消息',
      personal_center: '个人中心',
      report_management: '举报管理',
      sign_in: '登录',
      sign_out: '注销',
      sign_up: '注册'
    },
    text: {
      loading: '加载中',
      sign_in_warning_title: '请先登录',
      sign_in_warning_content: '你必须在登录后才能修改个人资料。',
      sign_out_confirm_title: '注销登录',
      sign_out_confirm_content: '你确定要登出 Wildfire 吗？'
    }
  },
  PersonalCenter: {
    btn: {
      delete: '删除',
      read: '已读',
      unread: '未读'
    },
    tab: {
      notification: '系统消息'
    },
    text: {
      details: '查看详情',
      empty_notif_list: '暂无消息',
      new_comment_on_page: '有人在 <a href="{{pageURL}}" target="blank">{{pageTitle}}</a> 发布了新评论。',
      'new_comment_on_page+': '<a title="{{email}}">{{displayName}}</a> 在 <a href="{{pageURL}}" title="点击访问 {{pageTitle}}" target="blank">{{pageTitle}}</a> 发布了 <a title="{{content}}">新评论</a>。',
      new_reply_to_comment: '有人回复了你的评论。 ',
      'new_reply_to_comment+': '<a title="{{email}}">{{displayName}}</a> 对你的评论进行了<a title="{{content}}">回复</a>。',
      new_disc_in_comment: '有人在你的评论的讨论中进行了回复。',
      'new_disc_in_comment+': '<a title="{{email}}">{{displayName}}</a> 在你的评论的讨论中进行了 <a title="{{content}}">回复</a> 。',
      new_mention: '有人在评论中 @ 了你。',
      'new_mention+': '<a title="{{email}}">{{displayName}}</a> 在 <a title="{{content}}">评论</a> 中 @ 了你。',
      notif_doesnt_exist: '该消息不存在。',
      related_content_no_longer_exists: '相关内容已不存在。',
      tips: '鼠标悬停在高亮文字上可查看更多内容；点击查看详情可跳转到相应网页。'
    }
  },
  ReplyArea: {
    btn: {
      cancel: '取消',
      clear: '清空',
      post: '发送',
      posting: '发送中',
      confirm: '确认'
    },
    error: {
      posting_comment: '评论失败。',
      banned_title: '禁止评论',
      banned_content: '您当前已被站长禁言，无法评论！'
    },
    placeholder: {
      join_conversation: '一起来发言吧...',
      join_conversation_anonymously: '以 匿名用户 身份发言...',
      reply_to_user_comment: '回复 {{username}} 的评论',
      user_is_banned: '你现在处于被站长禁言状态。'
    },
    success: {
      posting_comment: '评论成功！'
    },
    text: {
      initializing_mention_autocomplete: '初始化提及功能（@）自动补全中...',
      initialized_mention_autocomplete: '提及功能（@）自动补全已启用',
      mention_func_not_authorized: '登录以激活提及（@）功能'
    }
  },
  ReportManagement: {
    btn: {
      ban: '屏蔽',
      cancel: '取消',
      delete: '删除',
      ignore: '忽略',
      more: 'More',
      unban: '解除'
    },
    confirm: {
      banning_user: '确认要屏蔽该用户吗？',
      banning_user_anonymous: '该用户为匿名用户，确认要封禁其 IP 吗？',
      deleting_comment: '确认要删除这条被举报的评论吗？',
      ignoring_report: '确认要忽略这条举报吗？',
      unbanning_user: '确认要解除对该用户的屏蔽吗？'
    },
    error: {
      deleting_comment: '删除失败。',
      deleting_related_replies: '删除相关回复失败',
      banning_user: '屏蔽失败。',
      banning_user_invalid_ip: '该匿名用户无有效 IP，无法屏蔽！',
      banning_user_repeated: '请勿重复屏蔽。',
      unknown: '未知错误！'
    },
    success: {
      deleting_comment: '删除成功。',
      deleting_related_replies: '相关回复已被删除。',
      banning_user: '屏蔽成功！',
      unbanning_user: '已解除屏蔽！'
    },
    tab: {
      ban_list: '禁用列表',
      reported_comments: '被举报评论'
    },
    table: {
      action: '操作',
      comments: '评论',
      users: '用户',
      action_time: '操作时间'
    },
    text: {
      empty_reported_comment: '暂无被举报的评论',
      empty_banned_user: '暂无被屏蔽的用户',
      reported_by_n_users: '已被 {{count}} 位用户举报',
      deleting_with_n_replies: '与此评论相关的 {{count}} 条回复会被一同删除。',
      reason: '屏蔽原因： '
    }
  },
  UserSetting: {
    btn: {
      cancel: '取消',
      update: '更新'
    },
    error: {
      empty_confirm_pwd: '请再次输入你的新密码。',
      empty_new_pwd: '请输入你的新密码。',
      empty_old_pwd: '请输入你的旧密码。',
      invalid_photo_url: '不是有效的图片地址！',
      password: '密码错误！',
      password_min_length: '密码长度至少为 6 位。',
      passwords_dont_match: '两次输入的密码不一致。',
      invalid_form: '表单验证失败，请按要求填写！',
      unknown: '糟糕，出错了。'
    },
    label: {
      confirm_pwd: '确认密码',
      display_name: '昵称',
      new_pwd: '新密码',
      old_pwd: '旧密码',
      photo_url: '头像链接'
    },
    placeholder: {
      confirm_pwd: '再次输入你的新密码',
      display_name: '设置一个昵称吧',
      new_pwd: '新的密码',
      old_pwd: '旧的密码',
      photo_url: '头像图片链接'
    },
    success: {
      changing_password: '密码修改成功！',
      updating_profile: '更新成功！'
    },
    tab: {
      account: '账号设置',
      profile: '个人资料'
    }
  }
}
