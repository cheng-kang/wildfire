# Get Discussion Count

Now you are able to display discussion total of your page at somewhere else than the header!

<iframe width="100%" height="300" src="//jsfiddle.net/CHENGKANG/1qwneLr5/embedded/html,result/" allowpaymentrequest allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## Easy peasy

#### 1. Add "wf-discussion-count-unit" elements to your document.

> A `wf-discussion-count-unit` is an any element that has both the class name `wf-discussion-count-unit` and the attribute `wf-page-url` on it. 
> 
> The value of the attribute `wf-page-url` should be **the complete URL of the page** of which you wish to get the discussion total.

Make sure you have the class name `wf-discussion-count-unit` and attribute `wf-page-url` on your element.

#### 2. Specify your `wildfire` database related configs.

Tell `wildfire` where to find your data.

#### 3. Then load `wildfire.count.js`

And it will take care of all `wf-discussion-count-unit`s.

## Code Snippet

```
// 1. Add "wf-discussion-count-unit" element to your document.
// You can have multiple units if needed. 
// `wildfire.count.js` will take care of them all.
<span
    class="wf-discussion-count-unit"
    wf-page-url="http://chengkang.me/wildfire">
    loading...
</span>

// 2. Specify your `wildfire` database related configs.
<script type="text/javascript">
var wildfireConfig = () => ({
  databaseProvider: 'wilddog',
  databaseConfig: {
    siteId: 'wd2168973289ifdmcg'
  }
})
</script>
// 3. Then load `wildfire.count.js`
<script src="https://unpkg.com/wildfire/dist/wildfire.count.js"></script>
```