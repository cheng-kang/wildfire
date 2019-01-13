export const langZhTW = {
  common: {
    add_wildfire_to_your_site: '在你的網站使用 Wildfire',
    anonymous_user: '匿名使用者',
    btn: {
      cancel: '取消',
      confirm: '確認'
    },
    tip_prefix: '*小提示：',
    unknown_ip: '未知 IP 地址',
    unknown_user: '未知使用者'
  },
  AdminHelpers: {
    btn: {
      reset: '重置',
      resetting: '重置中...'
    },
    confirm: {
      resetting_discussion_count_for_all_pages: '確定要重置所有頁面的評論數量嗎？'
    },
    error: {
      resetting_discussion_count_for_all_pages: '出錯了，請稍後再試。'
    },
    success: {
      resetting_discussion_count_for_all_pages: '成功重置了所有頁面的評論數量！'
    },
    tab: {
      helpers: '輔助功能'
    },
    text: {
      desc_resetting_discussion_count_for_all_pages: '如果頁面的評論數量出現錯誤的話，你可以通過這個輔助功能重置所有頁面的評論數量。',
      resetting_discussion_count_for_all_pages: '重置所有頁面的評論數量'
    }
  },
  AuthForm: {
    btn: {
      cancel: '取消',
      sign_in: '登入',
      sign_up: '註冊'
    },
    error: {
      email_already_in_use: '此信箱已經註冊過了！',
      empty_confirm_pwd: '請再次輸入密碼。',
      empty_email: '信箱不能為空。',
      empty_pwd: '密碼不能為空。',
      invalid_email: '信箱格式不正確。',
      invalid_form: '表單驗證失敗，請按要求填寫！',
      operation_not_allowed: '信箱登入被禁止，請聯系站主！',
      passwords_dont_match: '兩次輸入的密碼不一致。',
      password_min_length: '密碼長度至少為 6 位。',
      weak_password: '密碼安全性太弱。',
      signing_in: '登錄失敗，請重試！',
      signing_up: '註冊失敗，請重試！',
      unknown: '糟糕，出錯了。'
    },
    label: {
      confirm_pwd: '確認密碼',
      email: '信箱',
      password: '密碼'
    },
    placeholder: {
      confirm_pwd: '再次輸入你的密碼',
      email: '你的信箱地址',
      password: '密碼長度至少 6 位'
    },
    success: {
      signing_in: '登錄成功！',
      signing_up: '註冊成功！'
    }
  },
  Body: {
    placeholder: {
      mention_autocomplete: '你要 @ 誰？'
    },
    text: {
      loading_comments: '評論加載中',
      loading_comments_failed: '評論加載失敗。',
      post_the_first_comment: '快來發布第一條評論吧！'
    }
  },
  CommentCard: {
    btn: {
      delete: '刪除',
      hide: '收起',
      reply: '回覆',
      confirm: '確認',
      report_comment: '舉報此評論',
      ban_user: '封禁該使用者',
      show_full_content: '展開全文',
      show_more_discussion: '展開更多 {{count}} 條討論',
      show_more_discussion_plural: '展開更多 {{count}} 條討論',
      show_less_content: '收起',
      show_less_discussion: '收起 {{count}} 條討論',
      show_less_discussion_plural: '收起 {{count}} 條討論'
    },
    confirm: {
      deleting_comment: '你確定要刪除這條評論嗎？'
    },
    error: {
      banning_user: '封禁使用者失敗。',
      deleting_comment: '刪除失敗。',
      repeated_banning: '這個使用者已經被封禁了。',
      repeated_reporting: '你已經舉報過這條評論。',
      reporting_comment: '舉報失敗，請稍後重試。',
      banned_title: '禁止操作',
      banned_content: '你當前已被站長禁言，無法操作！'
    },
    html_title: {
      dislike_comment: '踩這條評論。',
      like_comment: '給這條評論點讚！',
      image_onerror: '圖片加載失敗。'
    },
    success: {
      banning_user: '封禁成功。',
      deleting_comment: '刪除成功。',
      reporting_comment: '評論舉報成功。'
    },
    text: {
      deleted_comment: '該評論已不存在。',
      loading_comments_content: '加載評論內容中'
    }
  },
  Header: {
    btn: {
      cancel: '取消',
      comment: '條評論',
      comments: '條評論',
      confirm: '確認',
      sign_in: '登錄',
      sign_out: '註銷',
      sign_up: '註冊'
    },
    menu: {
      actions: '更多操作',
      admin_center: '站長中心',
      admin_helpers: '輔助功能',
      more: '更多操作',
      notification: '系統消息',
      personal_center: '個人中心',
      report_management: '舉報管理',
      sign_in: '登入',
      sign_out: '登出',
      sign_up: '註冊'
    },
    text: {
      loading: '加載中',
      sign_in_warning_title: '請先登入',
      sign_in_warning_content: '你必須在登入後才能修改個人資料。',
      sign_out_confirm_title: '登出',
      sign_out_confirm_content: '你確定要登出 Wildfire 嗎？'
    }
  },
  PersonalCenter: {
    btn: {
      delete: '刪除',
      read: '已讀',
      unread: '未讀'
    },
    tab: {
      notification: '系統消息'
    },
    text: {
      details: '查看詳情',
      empty_notif_list: '暫無消息',
      new_comment_on_page: '有人在 <a href="{{pageURL}}" target="blank">{{pageTitle}}</a> 發布了新評論。',
      'new_comment_on_page+': '<a title="{{email}}">{{displayName}}</a> 在 <a href="{{pageURL}}" title="點擊訪問 {{pageTitle}}" target="blank">{{pageTitle}}</a> 發布了 <a title="{{content}}">新評論</a>。',
      new_reply_to_comment: '有人回覆了你的評論。 ',
      'new_reply_to_comment+': '<a title="{{email}}">{{displayName}}</a> 對你的評論進行了<a title="{{content}}">回覆</a>。',
      new_disc_in_comment: '有人在你的評論的討論中進行了回覆。',
      'new_disc_in_comment+': '<a title="{{email}}">{{displayName}}</a> 在你的評論的討論中進行了 <a title="{{content}}">回覆</a> 。',
      new_mention: '有人在評論中 @ 了你。',
      'new_mention+': '<a title="{{email}}">{{displayName}}</a> 在 <a title="{{content}}">評論</a> 中 @ 了你。',
      notif_doesnt_exist: '該消息不存在。',
      related_content_no_longer_exists: '相關內容已不存在。',
      tips: '滑鼠停在高亮文字上可查看更多內容；點擊查看詳情可跳轉到相應網頁。'
    }
  },
  ReplyArea: {
    btn: {
      cancel: '取消',
      clear: '清空',
      post: '發送',
      posting: '發送中',
      confirm: '確認'
    },
    error: {
      posting_comment: '評論失敗。',
      banned_title: '禁止評論',
      banned_content: '您當前已被站長禁言，無法評論！'
    },
    placeholder: {
      join_conversation: '一起來發言吧...',
      join_conversation_anonymously: '以 匿名使用者 身份發言...',
      reply_to_user_comment: '回覆 {{username}} 的評論',
      user_is_banned: '你現在處於被站長禁言狀態。'
    },
    success: {
      posting_comment: '評論成功！'
    },
    text: {
      initializing_mention_autocomplete: '初始化提及功能（@）自動完成...',
      initialized_mention_autocomplete: '已啟用提及功能（@）自動完成',
      mention_func_not_authorized: '登入以啟用提及（@）功能',
      mention_func_not_authorized_banned_user: '你現在處於被禁言狀態。'
    }
  },
  ReportManagement: {
    btn: {
      ban: '屏蔽',
      cancel: '取消',
      delete: '刪除',
      ignore: '忽略',
      more: 'More',
      unban: '解除'
    },
    confirm: {
      banning_user: '確認要屏蔽該使用者嗎？',
      banning_user_anonymous: '該使用者為匿名使用者，確認要封禁其 IP 嗎？',
      deleting_comment: '確認要刪除這條被舉報的評論嗎？',
      ignoring_report: '確認要忽略這條舉報嗎？',
      unbanning_user: '確認要解除對該使用者的屏蔽嗎？'
    },
    error: {
      deleting_comment: '刪除失敗。',
      deleting_related_replies: '刪除相關回覆失敗',
      banning_user: '屏蔽失敗。',
      banning_user_invalid_ip: '該匿名使用者無有效 IP，無法屏蔽！',
      banning_user_repeated: '請勿重覆屏蔽。',
      unknown: '未知錯誤！'
    },
    success: {
      deleting_comment: '刪除成功。',
      deleting_related_replies: '相關回覆已被刪除。',
      banning_user: '屏蔽成功！',
      unbanning_user: '已解除屏蔽！'
    },
    tab: {
      ban_list: '禁用列表',
      reported_comments: '被舉報評論'
    },
    table: {
      action: '操作',
      comments: '評論',
      users: '使用者',
      action_time: '操作時間'
    },
    text: {
      empty_reported_comment: '暫無被舉報的評論',
      empty_banned_user: '暫無被屏蔽的使用者',
      reported_by_n_users: '已被 {{count}} 位使用者舉報',
      deleting_with_n_replies: '與此評論相關的 {{count}} 條回覆會被一同刪除。',
      reason: '屏蔽原因： '
    }
  },
  UserSetting: {
    btn: {
      cancel: '取消',
      update: '更新'
    },
    error: {
      empty_confirm_pwd: '請再次輸入你的新密碼。',
      empty_new_pwd: '請輸入你的新密碼。',
      empty_old_pwd: '請輸入你的舊密碼。',
      invalid_photo_url: '不是有效的圖片地址！',
      password: '密碼錯誤！',
      password_min_length: '密碼長度至少為 6 位。',
      passwords_dont_match: '兩次輸入的密碼不一致。',
      invalid_form: '表單驗證失敗，請按要求填寫！',
      unknown: '糟糕，出錯了。'
    },
    label: {
      confirm_pwd: '確認密碼',
      display_name: '昵稱',
      new_pwd: '新密碼',
      old_pwd: '舊密碼',
      photo_url: '大頭貼連結'
    },
    placeholder: {
      confirm_pwd: '再次輸入你的新密碼',
      display_name: '設置一個昵稱吧',
      new_pwd: '新的密碼',
      old_pwd: '舊的密碼',
      photo_url: '大頭貼圖片連結'
    },
    success: {
      changing_password: '密碼修改成功！',
      updating_profile: '更新成功！'
    },
    tab: {
      account: '帳號設置',
      profile: '個人資料'
    }
  }
}
