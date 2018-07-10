export default {
  common: {
    add_wildfire_to_your_site: '在你的网站使用 Wildfire',
    anonymous_user: '匿名用户',
    btn: {
      cancel: '取消',
      confirm: '确认',
    },
    reset_when_wilddog_too_many_connections: '当前数据库超载，正在切换至备用数据库。注意：主数据库和备用数据库间数据不互通。',
    unknown_ip: '未知 IP 地址',
    unknown_user: '未知用户',
    wilddog_too_many_connections: '当前数据库超载，请管理员及时处理。',
    wildfire_reset_not_found: '未找到全局 wildfire 重置方法。',
  },
  AddedPluginOptionForm: {
    error: {
      loading_option: '加载插件配置项失败。',
      update: '更新插件配置项失败。',
      invalid_form: '插件配置项表单验证失败。'
    },
    success: {
      update: '更新插件配置项成功。'
    },
  },
  AuthForm: {
    btn: {
      cancel: '取消',
      sign_in: '登录',
      sign_up: '注册',
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
      unknown: '糟糕，出错了。',
    },
    label: {
      confirm_pwd: '确认密码',
      email: '邮箱',
      password: '密码',
    },
    placeholder: {
      confirm_pwd: '再次输入你的密码',
      email: '你的邮箱地址',
      password: '密码长度至少 6 位',
    },
    success: {
      signing_in: '登录成功！',
      signing_up: '注册成功！',
    },
  },
  Body: {
    placeholder: {
      mention_autocomplete: '你要 @ 谁？',
    },
    text: {
      loading_comments: '评论加载中',
      loading_comments_failed: '评论加载失败。',
      post_the_first_comment: '快来发布第一条评论吧！',
    },
  },
  CommentCard: {
    btn: {
      delete: '删除',
      hide: '收起',
      reply: '回复',
      confirm: '确认',
      report_comment: '举报此评论',
      ban_user: '封禁该用户',
      show_full_content: '展开全文',
      show_more_discussion: '展开更多 {{count}} 条讨论',
      show_more_discussion_plural: '展开更多 {{count}} 条讨论',
      show_less_content: '收起',
      show_less_discussion: '收起 {{count}} 条讨论',
      show_less_discussion_plural: '收起 {{count}} 条讨论',
    },
    confirm: {
      deleting_comment: '你确定要删除这条评论吗？',
    },
    error: {
      banning_user: '封禁用户失败。',
      deleting_comment: '删除失败。',
      repeated_banning: '这个用户已经被封禁了。',
      repeated_reporting: '你已经举报过这条评论。',
      reporting_comment: '举报失败，请稍后重试。',
      banned_title: '禁止操作',
      banned_content: '你当前已被站长禁言，无法操作！',
    },
    html_title: {
      dislike_comment: '踩这条评论。',
      like_comment: '给这条评论点赞！',
      image_onerror: '图片加载失败。',
    },
    success: {
      banning_user: '封禁成功。',
      deleting_comment: '删除成功。',
      reporting_comment: '评论举报成功。',
    },
    text: {
      deleted_comment: '该评论已不存在。',
      loading_comments_content: '加载评论内容中',
    },
  },
  Footnote: {
    prefix: {
      tips: '*小提示：',
      note: '*注意：',
    },
  },
  Header: {
    btn: {
      cancel: '取消',
      comment: '条评论',
      comment_plural: '条评论',
      confirm: '确认',
      sign_in: '登录',
      sign_out: '注销',
      sign_up: '注册',
    },
    menu: {
      actions: '更多操作',
      admin_center: '站长中心',
      admin_helpers: '辅助功能',
      user_setting: '用户设置',
      notification: '系统消息',
      personal_center: '个人中心',
      plugin: '来自插件',
      plugin_center: '插件中心',
      report_management: '举报管理',
      sign_in: '登录',
      sign_out: '注销',
      sign_up: '注册',
    },
    text: {
      loading: '加载中',
      sign_in_warning_title: '请先登录',
      sign_in_warning_content: '你必须在登录后才能修改个人资料。',
      sign_out_confirm_title: '注销登录',
      sign_out_confirm_content: '你确定要登出 Wildfire 吗？',
    },
  },
  PersonalCenter: {
    btn: {
      delete: '删除',
      read: '已读',
      unread: '未读',
    },
    tab: {
      notification: '系统消息',
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
      tips: '鼠标悬停在高亮文字上可查看更多内容；点击查看详情可跳转到相应网页。',
    },
  },
  Plugin: {
    error: {
      no_plugin: '插件不存在。',
    },
  },
  PluginCenter: {
    btn: {
      add: '添加',
      reload: '重新加载',
      update: '更新',
    },
    error: {
      adding_plugin: '添加插件失败。',
      loading_plugin_list: '加载插件列表失败。',
      loading_plugin_meta: '加载插件基本信息失败。',
      toggling_added_plugin_state: '切换插件激活状态失败。',
      updating_order: '更新插件排序失败。',
    },
    success: {
      adding_plugin: '插件添加成功。',
      toggling_added_plugin_state: '插件激活状态切换成功。',
      updating_order: '更新插件排序成功。',
    },
    text: {
      no_added_plugin: '你还没有添加插件，快去插件市场看看吧！',
      no_plugin: '抱歉，暂时没有找到可用的插件。',
      plugin_added: '插件已添加',
    },
    title: {
      added_plugins: '已添加插件',
      desc: '描述',
      options: '配置',
      plugin_center: '插件中心',
      plugin_ordering: '插件排序',
    },
  },
  ReplyArea: {
    btn: {
      cancel: '取消',
      clear: '清空',
      post: '发送',
      posting: '发送中',
      confirm: '确认',
    },
    error: {
      posting_comment: '评论失败。',
      banned_title: '禁止评论',
      banned_content: '您当前已被站长禁言，无法评论！',
    },
    placeholder: {
      join_conversation: '一起来发言吧...',
      join_conversation_anonymously: '以 匿名用户 身份发言...',
      reply_to_user_comment: '回复 {{username}} 的评论',
      user_is_banned: '你现在处于被站长禁言状态。',
    },
    success: {
      posting_comment: '评论成功！',
    },
    text: {
      initializing_mention_autocomplete: '初始化提及功能（@）自动补全中...',
      initialized_mention_autocomplete: '提及功能（@）自动补全已启用',
      mention_func_not_authorized: '登录以激活提及（@）功能',
      mention_func_not_authorized_banned_user: '你现在处于被禁言状态。',
    },
  },
  ReportManagement: {
    btn: {
      ban: '屏蔽',
      cancel: '取消',
      delete: '删除',
      ignore: '忽略',
      more: 'More',
      unban: '解除',
    },
    confirm: {
      banning_user: '确认要屏蔽该用户吗？',
      banning_user_anonymous: '该用户为匿名用户，确认要封禁其 IP 吗？',
      deleting_comment: '确认要删除这条被举报的评论吗？',
      ignoring_report: '确认要忽略这条举报吗？',
      unbanning_user: '确认要解除对该用户的屏蔽吗？',
    },
    error: {
      deleting_comment: '删除失败。',
      banning_user: '屏蔽失败。',
      banning_user_invalid_ip: '该匿名用户无有效 IP，无法屏蔽！',
      banning_user_repeated: '请勿重复屏蔽。',
      unknown: '未知错误！',
    },
    success: {
      deleting_comment: '删除成功。',
      banning_user: '屏蔽成功！',
      unbanning_user: '已解除屏蔽！',
    },
    tab: {
      ban_list: '禁用列表',
      reported_comments: '被举报评论',
    },
    table: {
      action: '操作',
      comments: '评论',
      users: '用户',
      action_time: '操作时间',
    },
    text: {
      empty_reported_comment: '暂无被举报的评论',
      empty_banned_user: '暂无被屏蔽的用户',
      reported_by_n_users: '已被 {{count}} 位用户举报',
      deleting_with_n_replies: '与此评论相关的 {{count}} 条回复会被一同删除。',
      reason: '屏蔽原因： ',
    },
  },
  UserSetting: {
    btn: {
      cancel: '取消',
      update: '更新',
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
      unknown: '糟糕，出错了。',
    },
    label: {
      confirm_pwd: '确认密码',
      display_name: '昵称',
      new_pwd: '新密码',
      old_pwd: '旧密码',
      photo_url: '头像链接',
    },
    placeholder: {
      confirm_pwd: '再次输入你的新密码',
      display_name: '设置一个昵称吧',
      new_pwd: '新的密码',
      old_pwd: '旧的密码',
      photo_url: '头像图片链接',
    },
    success: {
      changing_password: '密码修改成功！',
      updating_profile: '更新成功！',
    },
    tab: {
      account: '账号设置',
      profile: '个人资料',
    },
  },
  Wildfire: {
    error: {
      loading_plugin: '加载插件失败。',
      loading_plugin_list: '加载插件列表失败。',
    },
  },
};
