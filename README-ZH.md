# Wildfire 野火评论系统 [![npm version](https://badge.fury.io/js/wildfire.svg)](https://badge.fury.io/js/wildfire)

> 请注意：`wildfire` 项目的正式 NPM 页面为：https://www.npmjs.com/package/wildfire 。

> ~~这个旧的页面 `@chengkang/wildfire` (https://www.npmjs.com/package/@chengkang/wildfire) 已被弃用。~~

[English Doc](https://github.com/cheng-kang/wildfire#wildfire-) | [中文说明文档](https://github.com/cheng-kang/wildfire/blob/master/README-ZH.md)

<p>
<!-- <p align="center"> -->
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/wildfire-logo.svg" height="60">
  <span>&emsp;=&emsp;</span>
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/wilddog.svg" height="40">
  <span>&emsp;+&emsp;</span>
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/firebase.png" height="45">
</p>

如果你的网站需要一个方便的评论系统的话，不妨试试 Wildfire 野火评论系统。

> *“星星之火可以燎原”。*
> 
> *—— 阿利盖利·但丁，《天堂》*

*注意：点击查看在线示例 [Firebase 示例](http://chengkang.me/wildfire) | [野狗示例](http://chengkang.me/wildfire/examples/demo-zh.html)。建议国内用户查看野狗示例 ;-)。*

## 链接

1. [使用方法](#usage)
2. [功能](#features)
3. [截图](#screenshots)

## 使用方法

### 1. 设置数据库

- 幻灯片：[如何为 Wildfire 设置 Firebase 数据库？](https://slides.com/chengkang/set-up-firebase-for-wildfire)

- 幻灯片：如何为 Wildfire 设置 Wilddog 数据库？ (待创建……你可以参考上一个幻灯片，二者设置步骤差不多，相信你能搞明白！:-D)

### 2. 将 Wildfire 添加到你的网站上

请看看这个幻灯片： [如何将 Wildfire 添加到你的网站](http://slides.com/chengkang/how-to-wildfire#/)

*注意：`Wildfire` 是用 `Vue.js` 开发的，因此你可以将其作为 Vue 组件来使用。 请参考 [示例 3](https://github.com/cheng-kang/wildfire/tree/master/examples/3)。*

一些链接：

1. 通过 CDN 使用
    - `wildfire.auto.js`: 
        - [JSFiddle: Wildfire Example: CDN (wildfire.auto.js)](https://jsfiddle.net/CHENGKANG/trdgbeeo/)
        - [exmaple 4](https://github.com/cheng-kang/wildfire/tree/master/examples/4)
    - `wilddog/wildfire.min.js` （如果你的项目中使用了 `Vue`）
        - [JSFiddle: Wildfire Example: CDN (wilddog/wildfire.min.js)](https://jsfiddle.net/CHENGKANG/99q5oow4/)
    - `firebase/wildfire.min.js` （如果你的项目中使用了 `Vue`）
        - [JSFiddle: Wildfire Example: CDN (firebase/wildfire.min.js)](https://jsfiddle.net/CHENGKANG/zrm1g9s8/)
2. 作为 UMD 模块使用
    - `wildfire.min.js`: 
        - [exmaple 3](https://github.com/cheng-kang/wildfire/tree/master/examples/3)
### 3. 自定义

以下是一个示例，请参看注释部分：

```html
<script>
  // 你可以自定义一些配置
  //
  // databaseProvider: 必须为 'wilddog' 或者 'firebase'
  // databaseConfig: 请从你的数据库控制台复制过来。
  // pageURL(可选): 默认为当前页面的 URL。
  // pageTitle(可选): 默认为当前页面的 title。
  // theme(可选): 'light'（默认）或者 'dark'。
  // locale(可选): 'en'（默认）或者 'zh-CN'
  // defaultAvatarURL(可选): 默认头像是一个可爱的消防员 :-D
  var wildfireConfig = () => ({
    databaseProvider: 'firebase',
    databaseConfig: YOUR_DATABASE_CONFIG,
    // pageURL: YOUR_PAGE_URL,
    // pageTitle: YOUR_PAGE_TITLE,
    // theme: 'light',
    // locale: 'en',
    // defaultAvatarURL: 'https://image.flaticon.com/icons/svg/621/621863.svg'
  })
</script>
<script src="https://unpkg.com/wildfire/dist/wildfire.auto.js"></script>
```

## 功能

1. 站主:
    - 数据库支持: 
      - [x] [`Firebase`](https://firebase.google.com/)
      - [x] [`Wilddog 野狗`](https://www.wilddog.com/).
    - 站主功能: 
      - [x] 删除评论
      - [x] 通过用户 IP 或 Email 屏蔽或禁言用户。

2. 匿名用户和登录用户:
    - [x] 评论（支持 Markdown 语法）
    - [x] 提及功能（@用户名）
    
3. 登录用户:
    - [x] 赞、踩评论
    - [x] 删除自己的评论
    - [x] 举报内容不当评论
    - 更新个人信息
      - [x] 用户名
      - [x] 头像
    - 个人中心:
      - [x] 系统通知

## 截图

<p align="center">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/1.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/2.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/3.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/4.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/5.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/6.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/7.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/0a063275/resources/screenshots/8.png" height="320">
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/6fada41b/resources/screenshots/wldfire-dark-theme.png" height="320">
</p>

## 开源许可协议

[GNU General Public License v3.0](https://github.com/cheng-kang/wildfire/blob/master/LICENSE)
