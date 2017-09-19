# Wildfire

<p align="center">
  <img src="./resources/wildfire-logo.svg" height="60">
  <span>&emsp;=&emsp;</span>
  <img src="https://img.wdstatic.cn/www-nd/images/logoNew-fdaaab5abe.svg" height="40">
  <span>&emsp;+&emsp;</span>
  <img src="https://firebase.google.com/_static/4273b0fc6c/images/firebase/lockup.png" height="45">
</p>

A comment service powered by Wilddog and Firebase. Wilddog is mainly for users from mainland China; Firebase for other regions and countries.

# Screenshot

<p align="center">
  <img src="./resources/screenshot-0.png" height="300">
  <img src="./resources/screenshot-1.png" height="300">
</p>

# Plan

## Current Status

- [x] `Firebase` support
- [x] sign in/sign out
- [x] comment
- [x] reply to comment
- [x] like/dislike a comment/reply

## Mind Graph

![](./resources/mind%20graph.png)

## Notice

For `mrliao 2017/9/18 commit`, If you have problems with iview in this commit, please:

1. delete the `package-lock.json`
2. run `npm install`, because I have added 2 dev package to fix the build bug.
3. run `npm run dev` or `npm run build`.
