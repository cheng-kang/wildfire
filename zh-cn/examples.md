# 代码示例

## 展示

你可以在本页底部体验 `wildfire`（当然在本文档的其他页面也可以 ;-D）。

更多展示，请看这个百科页面：[我们正在使用 Wildfire 野火评论系统！](https://github.com/cheng-kang/wildfire/wiki/%E6%88%91%E4%BB%AC%E6%AD%A3%E5%9C%A8%E4%BD%BF%E7%94%A8-Wildfire-%E9%87%8E%E7%81%AB%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F%EF%BC%81)

## 源代码中的示例

你可以在源代码的 `./examples` 文件夹中找到这些示例。

#### 示例 1

在 [./examples/1.html](https://github.com/cheng-kang/wildfire/blob/master/examples/1.html) 可以看到 `wildfire.auto.js` 的使用示例。

*数据库：`wilddog`。*

!> 注意：除非是使用 `wildfire.auto.js`（如示例 1），在加载 `wildfire.min.js` 之前，你需要先加载 <br> 1. [Vue.js](https://cdn.jsdelivr.net/npm/vue), <br> 2. 数据库的 JavaScript 文件 ([firebase.js](https://www.gstatic.com/firebasejs/4.6.2/firebase.js) 或者 [wilddog.js](https://cdn.wilddog.com/sdk/js/2.5.17/wilddog.js)), <br> 3. [wildfire.css](https://unpkg/wildfire/dist/firebase/static/wildfire.css)。

#### 示例 2

在 [./examples/2.html](https://github.com/cheng-kang/wildfire/blob/master/examples/2.html) 可以找到用 `firebase/wildfire.min.js` 将 `wildfire` 作为 `Vue` 组件使用的示例。

*数据库：`firebase`。*

#### 示例 3

在 [./examples/3](https://github.com/cheng-kang/wildfire/blob/master/examples/3) 可以找到在标准的 `Vue` app 中使用 `wildfire` 的示例。

运行 `npm run dev`，然后在浏览器打开 `http://localhost:8080` 来查看这个示例。

*数据库：`firebase`。*

#### 示例 4

在 [./examples/4.html](https://github.com/cheng-kang/wildfire/blob/master/examples/4.html) 可以找到另一个使用 `wildfire.auto.js` 的示例。

**这个示例是通过 [UNPKG](https://unpkg.com) 来加载 `wildfire`。**

*数据库：`wilddog`。*

## JSFiddle

#### wildfire.auto.js

> 如果你的网站中没有使用 `Vue`：

https://jsfiddle.net/CHENGKANG/trdgbeeo/

<iframe width="100%" height="300" src="//jsfiddle.net/CHENGKANG/trdgbeeo/embedded/html,css,result/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

#### wilddog/wildfire.min.js

> 如果你的网站中使用了 `Vue`：

https://jsfiddle.net/CHENGKANG/99q5oow4/

<iframe width="100%" height="300" src="//jsfiddle.net/CHENGKANG/99q5oow4/embedded/html,css,result/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

#### firebase/wildfire.min.js

> 如果你的网站中使用了 `Vue`：

https://jsfiddle.net/CHENGKANG/zrm1g9s8/

<iframe width="100%" height="300" src="//jsfiddle.net/CHENGKANG/zrm1g9s8/embedded/html,css,result/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>