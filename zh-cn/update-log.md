# 更新日志

## 公测版本

### v0.3.3

*日期：2017-12-28*

**改进**

- 在项目中所有的自定义类名前添加了 `wf-` 前缀以避免类名冲突。

**更新**

- 更新了日期时间文本的格式。现在评论的日期时间会被展示为 `2017-12-28 23:00`。
- 将 `评论` 功能的提示文字修改为图标，并添加了文本提示。

### v0.3.2

*日期：2017-12-27*

**改进**

- 在（1）`replyToComment` 的文字提示和（2）通知消息项的 title 属性的内容，由原来的 Markdown 内容改变为提取出来的文本内容。现在你在这些地方不会看到 HTML 标签了。

**修复**

- 发送评论、回复后通知消息未被派送的问题。
- `WfReportedManagement.vue` 中 iView 文字提示组件 transfer-dom 的问题。 in 
- 一些其他的样式问题。

### v0.3.1

*日期：2017-12-27*

**修复**

- [Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.](https://github.com/cheng-kang/wildfire/issues/16)
- 修复了某些 `Hexo` 主题下 UI 的问题。

### v0.3.0

*日期：2017-12-26*

**新功能**

- 站长辅助功能：站长辅助功能用于清理评论数据。在这次发布中，新增了一个辅助功能：重置所有页面的评论数量统计。详情请查看 [重置所有页面评论数量统计](/zh-cn/admin-helpers.md#_1-reset-discussion-count-for-all-pages)。
- `wildfire.count.js`：用于获取制定页面评论总数的脚本。详情请查看 [获取评论数](/zh-cn/get-discussion-count.md)。

### v0.2.3

*日期：2017-12-25*

**更新**

- 修复了评论内容中的 `<a>` 标签的下划线在上一个版本中被影响无法正常显示的问题。

### v0.2.2

*日期：2017-12-25*

**更新**

- 修复了 `<a>` 标签的 `href` 属性未被正常渲染的问题。
- 修复了部分 `<a>` 标签样式与用户网站冲突的问题。

### v0.2.1

*日期：2017-12-24*

**更新**

- 修改了 `wildfire.auto.js` 中 Vue 的 CDN 链接。
- 修复了少量样式问题。

### v0.2.0

*日期：2017-12-19*

**新功能**

- 添加了 HTML sanitizor 以防止 XSS 攻击。

**修复**

- 少量样式问题
