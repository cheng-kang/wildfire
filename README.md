# Wildfire [![npm version](https://badge.fury.io/js/wildfire.svg)](https://badge.fury.io/js/wildfire)

> If you are using `Wildfire`, please share your website here: [We are using Wildfire!](https://github.com/cheng-kang/wildfire/issues/9) :-D.

[English Doc](https://github.com/cheng-kang/wildfire#wildfire-) | [中文说明文档](https://github.com/cheng-kang/wildfire/blob/master/README-ZH.md)

<p>
<!-- <p align="center"> -->
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/wildfire-logo.svg" height="60">
  <span>&emsp;=&emsp;</span>
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/wilddog.svg" height="40">
  <span>&emsp;+&emsp;</span>
  <img src="https://cdn.rawgit.com/cheng-kang/wildfire/d37678ae/resources/firebase.png" height="45">
</p>

A drop-in replacement for other comment systems.

> *"From a little spark may burst a flame".*
> 
> *—— Dante Alighieri, Paradiso*

*Note: Live demos are available at [Demo with Firebase](http://chengkang.me/wildfire) | [Demo with Wildfire](http://chengkang.me/wildfire/examples/demo-zh.html). We recommend users from `mainland China` to check the later one.*

<br><br><br>
> *The official NPM package page for this project `wildfire` is https://www.npmjs.com/package/wildfire.*
> 
> *~~The old package `@chengkang/wildfire` (https://www.npmjs.com/package/@chengkang/wildfire) has been deprecated.~~*

## Links

1. [Usage](#usage)
    1. [Set up your database](#1-set-up-your-database)
    2. [Add Wildfire to your website](#2-add-wildfire-to-your-website)
    3. [Customization](#3-customization)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Update Log](#update-log)

## Usage

### 1. Set up your database

- Slides: [How to set up Firebase for Wildfire?](https://slides.com/chengkang/set-up-firebase-for-wildfire)

- Slides: How to set up Wilddog for Wildfire? (to be created... Though this should be similar to the steps of setting up Firebase for Wildfire, so take a look at the previous slides and you will be able to figure out yourself :-D)

### 2. Add Wildfire to your website

Read the slides: [How to add Wildfire to your website?](http://slides.com/chengkang/how-to-wildfire#/)

*Note: Since `Wildfire` is developed with `Vue.js`, you can use it as a **Vue component** in your Vue project. E.g. [exmaple 3](https://github.com/cheng-kang/wildfire/tree/master/examples/3).*

Quick links:

1. CDN
    - `wildfire.auto.js`: 
        - [JSFiddle: Wildfire Example: CDN (wildfire.auto.js)](https://jsfiddle.net/CHENGKANG/trdgbeeo/)
        - [exmaple 4](https://github.com/cheng-kang/wildfire/tree/master/examples/4)
    - `wilddog/wildfire.min.js` (if you are using `Vue` in your project)
        - [JSFiddle: Wildfire Example: CDN (wilddog/wildfire.min.js)](https://jsfiddle.net/CHENGKANG/99q5oow4/)
    - `firebase/wildfire.min.js` (if you are using `Vue` in your project)
        - [JSFiddle: Wildfire Example: CDN (firebase/wildfire.min.js)](https://jsfiddle.net/CHENGKANG/zrm1g9s8/)
2. UMD
    - `wildfire.min.js`: 
        - [exmaple 3](https://github.com/cheng-kang/wildfire/tree/master/examples/3)

### 3. Customization

Here is an example.

```html
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

## Features

1. For site owners:
    - Database Support: 
      - [x] [`Firebase`](https://firebase.google.com/)
      - [x] [`Wilddog`](https://www.wilddog.com/).
    - Admin Function: 
      - [x] Delete comment
      - [x] Ban users by their IP/email

2. For all visitors (anonymous & authorized):
    - [x] Comment (with `Markdown` support)
    - [x] Mention (@username)
    
3. For authorized visitors:
    - [x] Like/dislike a comment
    - [x] Delete own comments
    - [x] Report inappropriate comments
    - Update user profile
      - [x] Display name
      - [x] Avatar
    - Personal Center:
      - [x] Notification

## Screenshots

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

## Update Log

[Update Log](https://github.com/cheng-kang/wildfire/wiki/Update-Log) | [更新日志](https://github.com/cheng-kang/wildfire/wiki/%E6%9B%B4%E6%96%B0%E6%97%A5%E5%BF%97)

## License

[GNU General Public License v3.0](https://github.com/cheng-kang/wildfire/blob/master/LICENSE)
