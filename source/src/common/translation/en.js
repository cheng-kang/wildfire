export const langEn = {
  common: {
    add_wildfire_to_your_site: 'Add Wildfire to your site',
    anonymous_user: 'Anonymous',
    unknown_ip: 'Unknown IP address',
    unknown_user: 'Unknown User'
  },
  AuthForm: {
    btn: {
      cancel: 'Cancel',
      sign_in: 'Sign In',
      sign_up: 'Sign Up'
    },
    error: {
      email_already_in_use: 'Email already used, try another one or sign in.',
      empty_confirm_pwd: 'Please enter your password again.',
      empty_email: 'Please enter email.',
      empty_pwd: 'Please enter password.',
      invalid_email: 'Invalid email address.',
      invalid_form: 'Invalid form. Please check and retry.',
      operation_not_allowed: 'Email accounts are not enabled, please contact the admin!', // ?
      passwords_dont_match: 'The two passwords don\'t match.',
      password_min_length: 'Password should be at least 6 digits.',
      weak_password: 'Please enter a stronger password.',
      signing_in: 'Sign in failed, please try again!',
      signing_up: 'Sign up failed, please try again!',
      unknown: 'Oops! Something went wrong!'
    },
    label: {
      confirm_pwd: 'Confirm',
      email: 'Email',
      password: 'Password'
    },
    placeholder: {
      confirm_pwd: 're-enter your password',
      email: 'your email address',
      password: 'at least 6 digits'
    },
    success: {
      signing_in: 'Signed in!',
      signing_up: 'Successfully signed up!'
    }
  },
  Body: {
    placeholder: {
      mention_autocomplete: 'who do you want to mention?'
    },
    text: {
      loading_comments: 'Loading comments',
      loading_comments_failed: 'Failed to load comments.',
      post_the_first_comment: 'Post the first comment!'
    }
  },
  CommentCard: {
    btn: {
      delete: 'Delete',
      hide: 'Hide',
      reply: 'Reply',
      confirm: 'Confirm',
      report_comment: 'Report this comment',
      ban_user: 'Ban this user',
      show_full_text: 'Show full text',
      show_more_discussion: 'Show more',
      show_less_discussion: 'Show less',
      show_less_text: 'Show less text'
    },
    confirm: {
      deleting_comment: 'Are you sure to delete this comment?'
    },
    error: {
      deleting_comment: 'Failed to delete.',
      repeated_reporting: 'You had already reported this comment!',
      reporting_comment: 'Something went wrong, please try again later.',
      banned_title: 'Banned',
      banned_content: 'You are currently banned from this action!'
    },
    html_title: {
      dislike_comment: 'Dislike this comment.',
      like_comment: 'Like this comment!'
    },
    success: {
      deleting_comment: 'Deleted.',
      reporting_comment: 'Comment reported.'
    },
    text: {
      deleted_comment: 'This Comment has been deleted.',
      loading_comments_content: 'Loading comment content...'
    }
  },
  Header: {
    btn: {
      cancel: 'Cancel',
      comment: 'Comment',
      comments: 'Comments',
      confirm: 'Confirm',
      sign_in: 'Sign In',
      sign_out: 'Sign Out',
      sign_up: 'Sign Up'
    },
    menu: {
      actions: 'Actions',
      admin_center: 'Admin',
      more: 'More',
      notification: 'Notification',
      personal_center: 'Personal',
      report_management: 'Reports',
      sign_in: 'Sign In',
      sign_out: 'Sign Out',
      sign_up: 'Sign Up'
    },
    text: {
      loading: 'Loading',
      sign_in_warning_title: 'Please Sign In',
      sign_in_warning_content: 'You need to Sign in first before modifying your profile.',
      sign_out_confirm_title: 'Sign Out',
      sign_out_confirm_content: 'Are you sure to sign out Wildfire?'
    }
  },
  PersonalCenter: {
    btn: {
      delete: 'Delete',
      read: 'Read',
      unread: 'Unread'
    },
    tab: {
      notification: 'Notification'
    },
    text: {
      details: 'Details',
      empty_notif_list: 'No notification.',
      new_comment_on_page: 'Someone posted new comment on <a href="{{pageURL}}" target="blank">{{pageTitle}}</a>.',
      'new_comment_on_page+': '<a title="{{email}}">{{displayName}}</a> posted <a title="{{content}}">new comment</a> on <a href="{{pageURL}}" title="Click to visit {{pageTitle}}" target="blank">{{pageTitle}}</a>.',
      new_reply_to_comment: 'Someone posted new reply your comment.',
      'new_reply_to_comment+': '<a title="{{email}}">{{displayName}}</a> posted <a title="{{content}}">new reply</a> to your comment.',
      new_disc_in_comment: 'Someone posted new reply in the discussion of your comment.',
      'new_disc_in_comment+': '<a title="{{email}}">{{displayName}}</a> posted <a title="{{content}}">new reply</a> in the discussion of your comment.',
      new_mention: 'Someone mentioned you in comment.',
      'new_mention+': '<a title="{{email}}">{{displayName}}</a> mentioned you in <a title="{{content}}">comment</a>.',
      notif_doesnt_exist: 'Notification doesn\'t exist.',
      related_content_no_longer_exists: 'Related content no longer exists.',
      tips: '*Tips: view more information by hovering your mouse on the highlighted text; open related webpage by clicking Details button.'
    }
  },
  ReplyArea: {
    btn: {
      cancel: 'Cancel',
      clear: 'Clear',
      post: 'Post',
      posting: 'Posting',
      confirm: 'Confirm'
    },
    error: {
      posting_comment: 'Failed to post comment.',
      banned_title: 'Banned',
      banned_content: 'You are currently banned from making comments'
    },
    placeholder: {
      join_conversation: 'Join the discusstion...',
      join_conversation_anonymously: 'Join the discusstion as Anonymous User',
      reply_to_user_comment: 'reply to {{username}}\'s comment',
      user_is_banned: 'You are currently banned by the site owner.'
    },
    success: {
      posting_comment: 'Comment posted!'
    },
    text: {
      initializing_mention_autocomplete: 'Initializing Mention (@) auto-complete...',
      initialized_mention_autocomplete: 'Mention (@) auto-complete is on',
      mention_func_not_authorized: 'Sign in to enable Mention (@)'
    }
  },
  ReportManagement: {
    btn: {
      ban: 'Ban',
      cancel: 'Cancel',
      delete: 'Delete',
      ignore: 'Ignore',
      more: 'More',
      unban: 'Unban'
    },
    confirm: {
      banning_user: 'Sure to ban this user?',
      banning_user_anonymous: 'This is an anonymous user, ban the IP?',
      deleting_comment: 'Sure to delete this reported comment?',
      ignoring_report: 'Sure to ignore this report?',
      unbanning_user: 'Sure to unban this user?'
    },
    error: {
      deleting_comment: 'Failed to delete comment.',
      deleting_related_replies: 'Failed to delete related replies',
      banning_user: 'Failed to ban.',
      banning_user_invalid_ip: 'Invalid IP address, cannot be banned!',
      banning_user_repeated: 'Banned already.',
      unknown: 'Unknown error!'
    },
    success: {
      deleting_comment: 'Comment Deleted.',
      deleting_related_replies: 'Related replies deleted.',
      banning_user: 'Banned.',
      unbanning_user: 'Unbanned.'
    },
    tab: {
      ban_list: 'Ban List',
      reported_comments: 'Reported Comments'
    },
    table: {
      action: 'Action',
      comments: 'Comments',
      users: 'Users',
      action_time: 'Time'
    },
    text: {
      reported_by_n_users: 'Reported by {{count}} user(s)',
      deleting_with_n_replies: '{{count}} replies to this comment will also be deleted. ',
      reason: 'Reason: '

    }
  },
  UserSetting: {
    btn: {
      cancel: 'Cancel',
      modify: 'Modify'
    },
    error: {
      empty_confirm_pwd: 'Please enter your new password again.',
      empty_new_pwd: 'Please enter new password.',
      empty_old_pwd: 'Please enter old password.',
      invalid_photo_url: 'Invalid avatar image URL.',
      password: 'Wrong password.',
      password_min_length: 'Password should be at least 6 digits.',
      passwords_dont_match: 'The two passwords don\'t match.',
      invalid_form: 'Invalid form. Please check and retry.',
      unknown: 'Oops! Something went wrong!'
    },
    label: {
      confirm_pwd: 'Confirm',
      display_name: 'Nickname',
      new_pwd: 'New Password',
      old_pwd: 'Old Password',
      photo_url: 'Avatar URL'
    },
    placeholder: {
      confirm_pwd: 'confirm your new password',
      display_name: 'choose a nickname',
      new_pwd: 'new Password',
      old_pwd: 'old Password',
      photo_url: 'enter the URL for your avatar image'
    },
    success: {
      changing_password: 'Password changed.',
      updating_profile: 'Updated'
    },
    tab: {
      account: 'Account',
      profile: 'Profile'
    }
  }
}
