# 配置

`wildfire` 支持多方面的自定义。了解一下下面的配置项吧。

## databaseProvider `必须`

- 类型：`String`
- 可选值： `'firebase'` or `'wilddog'`

你必须指定数据库提供者，除非你在使用预编译好的子包（`firebase/wildfire.min.js` 或者 `wilddog/wildfire.min.js`）。

*如果这个配置项不合法的话，会有错误信息被展示出来。*

## databaseConfig `必须`

- 类型：`Object`

从你的数据库控制台把配置对象复制粘贴到这里。不知道该怎么做？看看 [2. 将 `wildfire` 添加到你的网站](/zh-cn/usage.md#_2-%e5%b0%86-wildfire-%e6%b7%bb%e5%8a%a0%e5%88%b0%e4%bd%a0%e7%9a%84%e7%bd%91%e7%ab%99)

*如果这个配置项不合法的话，会有错误信息被展示出来。*

## pageURL `可选`

- 类型：`URL`
- 默认：`window.location.href`

`pageURL` 用于区别不同的页面。这意味着，如果你想在多个页面共享评论的话，把这个配置项设置为同一个 URL 就好了。

## pageTitle `可选`

- 类型：`String`
- 默认：`document.title`

`pageTitle` 在通知消息中被用到。它用于帮助用户确认通知消息的来源页面。

## theme `可选`

- 类型：`String`
- 默认：`light`
- 可选值：`light` or `dark`

他们长这样：

<div style="text-align: center;">
  <img src="https://camo.githubusercontent.com/66133591324cb2e314f1c3f93480e2a80ed956f3/68747470733a2f2f63646e2e7261776769742e636f6d2f6368656e672d6b616e672f77696c64666972652f30613036333237352f7265736f75726365732f73637265656e73686f74732f312e706e67" width="200">
  <img src="https://camo.githubusercontent.com/823b150af3893edf0ad4dd0e0b6b9a4c9826c136/68747470733a2f2f63646e2e7261776769742e636f6d2f6368656e672d6b616e672f77696c64666972652f64393836323633322f7265736f75726365732f73637265656e73686f74732f776c64666972652d6461726b2d7468656d652e706e67" width="200">
</div>

## locale `可选`

- 类型：`String`
- 默认：`en`
- 可选值：`en` or `zh-CN`

目前我们支持 英文（`en`）和 简体中文（`zh-CN`）。

**欢迎贡献新的语言！**

## defaultAvatarURL `可选`

- 类型：`URL`
- 默认：`https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg`

默认的默认头像是 <img src="https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg" width="45">。

**是一个消防员哦！！！**

## 示例 

这个代码片段展示了 `wildfire` 配置长什么样，以及如何配置你的 `wildfire`。

```
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
  //
  var wildfireConfig = () => ({
    databaseProvider: YOUR_DATABASE_PROVIDER,
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
