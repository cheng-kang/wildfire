# 获取页面评论数

现在你可以在其他地方展示你的页面评论总数了！

<iframe width="100%" height="300" src="//jsfiddle.net/CHENGKANG/1qwneLr5/embedded/html,result/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 超级简单

#### 1. 在你的文档中添加 "wf-discussion-count-unit" 元素。

> `wf-discussion-count-unit` 是包含 `wf-discussion-count-unit` 类名和 `wf-page-url` 属性的任意元素。
> 
> `wf-page-url` 的值必须是你要获取评论总数的页面的**完整 URL**。

请确保你的元素上有类名 `wf-discussion-count-unit` 和属性 `wf-page-url`。

#### 2. 添加数据库相关的配置

告诉 `wildfire` 去哪儿找你的数据。

#### 3. 然后加载 `wildfire.count.js`

接下来它会搞定所有 `wf-discussion-count-unit` 元素的。

## 代码片段

```
// 1. 在你的文档中添加 "wf-discussion-count-unit" 元素。
// 如果需要的话，你可以添加多个 "wf-discussion-count-unit" 元素。
// `wildfire.count.js` 会把每一个都处理到。
<span
    class="wf-discussion-count-unit"
    wf-page-url="http://chengkang.me/wildfire">
    加载中...
</span>

// 2. 添加数据库相关的配置
<script type="text/javascript">
var wildfireConfig = () => ({
  databaseProvider: 'wilddog',
  databaseConfig: {
    siteId: 'wd2168973289ifdmcg'
  }
})
</script>
// 3. 然后加载 `wildfire.count.js`
<script src="https://unpkg.com/wildfire/dist/wildfire.count.js"></script>
```
