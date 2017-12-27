# 管理员

`wildfire` 给站主提供了一些管理员功能以帮助他们更好地管理。这些功能仅对 `管理员用户` 开放。

## 管理员用户

要给一个用户管理员权限，你只需要将 `users/${uid}/isAdmin`  节点的值设置为 `true`（*类型：boolean*）。

!> 请确保你将其设置为一个**逻辑真值** `true`，不能设置为字符串 `"true"`。

<img src="_static/images/set-admin-user.png" width="400">

你可以设置任意数量的管理员用户。他们的权限全都一样。


## 管理员用户特有功能

- 删除任意评论
- 通过用户 IP 或 Email 进行屏蔽
- [重置所有页面评论数量统计](/zh-cn/admin-helpers.md#_1-reset-discussion-count-for-all-pages)
- [获取评论数](/zh-cn/get-discussion-count.md)
- [管理员辅助功能](/zh-cn/admin-helpers.md)
