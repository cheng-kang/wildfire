module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
  ],
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  'rules': {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': ['error', { 'functions': false, 'classes': true }],
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'padded-blocks': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
