# Configuration

`wildfire` supports custimization on several aspects. Check the options below.

## databaseProvider `required`

- Type: `String`
- Value: `'firebase'` or `'wilddog'`

You must specify the database provider unless using a pre-compiled sub-package (`firebase/wildfire.min.js` or `wilddog/wildfire.min.js`). 

*Error message will be shown if this config is not valid.*

## databaseConfig `requried`

- Type: `Object`

Copy the config object from your database console, then paste it here. Not sure where? Check [2. Add wildfire to your website](usage.md#_2-add-wildfire-to-your-website)

*Error message will be shown if this config is not valid.*

## pageURL `optional`

- Type: `URL`
- Default: `window.location.href`

`pageURL` is used to identify individual pages. That means if you want to share comments between multiple pages, just set this option to a common URL.

## pageTitle `optional`

- Type: `String`
- Default: `document.title`

`pageTitle` is used in notifications. It helps users to identify the page where notifications come from.

## theme `optional`

- Type: `String`
- Default: `light`
- Value: `light` or `dark`

They look like these:

<div style="text-align: center;">
<img src="https://camo.githubusercontent.com/66133591324cb2e314f1c3f93480e2a80ed956f3/68747470733a2f2f63646e2e7261776769742e636f6d2f6368656e672d6b616e672f77696c64666972652f30613036333237352f7265736f75726365732f73637265656e73686f74732f312e706e67" width="200">
<img src="https://camo.githubusercontent.com/14103769d32ee93c84cd5cc8475c8e276de9624b/68747470733a2f2f63646e2e7261776769742e636f6d2f6368656e672d6b616e672f77696c64666972652f36666164613431622f7265736f75726365732f73637265656e73686f74732f776c64666972652d6461726b2d7468656d652e706e67" width="200">
</div>

## locale `optional`

- Type: `String`
- Default: `en`
- Value: `en` or `zh-CN`

Currently we support only English (`en`) and Simplified Chinese (`zh-CN`). 

**Contribution welcomed!**

## defaultAvatarURL `optional`

- Type: `URL`
- Default: `https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg`

The default default avartar is <img src="https://cdn.rawgit.com/cheng-kang/wildfire/088cf3de/resources/wildfire-avatar.svg" width="45">.

**A fire fighter!!!**

## Example 

This code snippet is an example of how `wildfire` configuration looks like, and how to configure your `wildfire`.

```
<script>
  // Replace the configs with your own configs
  //
  // databaseProvider: (String) 'wilddog' or 'firebase'
  // databaseConfig: (Object) the config object copied from your database console
  // pageURL(optional): (String) default value is current URL
  // pageTitle(optional): (String) default value is current document title
  // theme(optional): (String) 'light'(default) or 'dark'
  // locale(optional): (String) 'en'(default) or 'zh-CN'
  // defaultAvatarURL(optional): (String) default avatar is a cute fire fighter :-D
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