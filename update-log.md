# Update Log

## Beta Versions

### v0.3.3

*Date: 2017-12-28*

**Enhancement**

- Added prefix `wf-` to all custom class names used in the project to avoid class name collisions.

**Changes**

- Updated datetime text format. Now comment datetime will be shown as `2017-12-28 23:00`.
- Changed `mention` placeholder text to icon, and added tooltip.

### v0.3.2

*Date: 2017-12-27*

**Enhancement**

- The content displayed at (1) `replyToComment` tooltip, and (2) the title attribute of notification item have been changed raw Markdown content to extracted text content. Now you won't see HTML tags at these places.

**Fixes**

- Notifications were not being sent after posting comments/replies.
- iView tooltip transfer-dom bug in `WfReportedManagement.vue`
- Some other styling issues.

### v0.3.1

*Date: 2017-12-27*

**Fixes**

- [Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.](https://github.com/cheng-kang/wildfire/issues/16)
- Fixes UI issues with some `Hexo` themes.

### v0.3.0

*Date: 2017-12-26*

**New Features**

- Admin Helper Functions: admin helpers are used to reset things and clear unexpected errors. In this release, one helper function is added: reset discussion count of all pages. Check [Reset discussion count of all pages](admin-helpers.md#_1-reset-discussion-count-for-all-pages) for more details.
- `wildfire.count.js`: a new script for getting dicussion total of specific page(s). Check [Get discussion count](get-discussion-count.md) for more details.

### v0.2.3

*Date: 2017-12-25*

**Changes**

- Fixed styling issue: the underline of `<a>` tag with comment body was affected by the last release, this release fixed the issue.

### v0.2.2

*Date: 2017-12-25*

**Changes**

- Fixed bug: `href` of `<a>` tags not being rendered
- Fixed styling issue: `<a>` tag styling collision with user websites.

### v0.2.1

*Date: 2017-12-24*

**Changes**

- Updated CDN link for Vue in `wildfire.auto.js`
- Fixed minor styling issue. 

### v0.2.0

*Date: 2017-12-19*

**New Features**

- Added HTML sanitizor to avoid XSS attack.

**Fixes**

- Minor styling issues
