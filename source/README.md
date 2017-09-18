# wildfire

> A comment service powered by Wilddog and Firebase. Wilddog is mainly for users from mainland China; Firebase for other regions and countries.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Notice

For `mrliao 2017/9/18 commit`, If you have problems with iview in this commit, please:

1. delete the `package-lock.json`
2. run `npm install`, because I have added 2 dev package to fix the build bug.
3. run `npm run dev` or `npm run build`.