<template>
  <div :class="classes">
    <component
      v-for="(cpntName, idx) in pluginComponents.header.before"
      :is="cpntName"
      :key="cpntName+idx"
      v-bind="pluginProps(cpntName)"/>
    <wf-header :comments-loading-state="commentsLoadingState"/>
    <component
      v-for="(cpntName, idx) in pluginComponents.header.after"
      :is="cpntName"
      :key="cpntName+idx"
      v-bind="pluginProps(cpntName)"/>
    <wf-body
      :page-comments-count="pageCommentsCount"
      :comments="commentsWithId"
      :comments-loading-state="commentsLoadingState"/>
    <component
      v-for="(cpntName, idx) in pluginComponents.footer.before"
      :is="cpntName"
      :key="cpntName+idx"
      v-bind="pluginProps(cpntName)"/>
    <wf-footer/>
  </div>
</template>

<script>
import Vue from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';
import WfHeader from './layout/WfHeader';
import WfBody from './layout/WfBody';
import WfFooter from './layout/WfFooter';
import { bus, butler, PLUGIN_LIST_CDN } from './common';
import { injectPlugin, ejectPlugin, PCM, PHM, pluginProps } from './plugin';
import { getKey } from './utils';

export default {
  name: 'wildfire',
  components: {
    WfHeader,
    WfBody,
    WfFooter,
  },
  data() {
    return {
      commentsLoadingState: 'prepare',
      pageCommentsCount: 0,
      pageComments: [],
      comments: [],
      banData: [],
      banList: [],
    };
  },
  computed: {
    pluginComponents: () => ({
      header: {
        before: PCM.get('header.before'),
        after: PCM.get('header.after'),
      },
      footer: {
        before: PCM.get('footer.before'),
      },
    }),
    pluginProps: () => pluginProps,
    classes() {
      return [
        'wf',
        `wf-theme-${butler.config.theme}`,
      ];
    },
    commentsWithId() {
      return this.comments.map((comment) => Object.assign(
        { replies: {} },
        comment,
        { commentId: comment['.key'] },
      )).reverse(); // reverse the list to get descending comments
    },
  },
  created() {
    this.listenToAuthStateChange();
    this.listenToCommentsFromDatabase();
    this.listenToPluginCenter();
    /**
     * ↓This observer watches user profile updates
     *  and change accordingly. The change here will
     *  affect all child components.
     */
    bus.$on('CurrentUserInfoUpdated', updates => {
      bus.user = Object.assign({}, bus.user, {
        displayName: updates['/displayName'],
        photoURL: updates['/photoURL'],
      });
    });

    this.$bindAsArray('banData', butler.db.ref('ban'));

    Vue.http.get('https://api.userinfo.io/userinfos')
      .then(response => {
        bus.info = Object.assign({}, bus.info, { ip: response.data.ip_address });
        this.checkBanState();
        return response.data;
      })
      .catch(error => {
        console.error(error);
        bus.info = Object.assign({}, bus.info, { ip: 'unknown' });
      })
      .then(data => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') { return; }
        const { pageURL, pageTitle, databaseProvider } = butler.config;
        const wfAnalyticsURL = `${databaseProvider === 'firebase' ? 'https://wildfire-bada3.firebaseio.com/' : 'https://autolayout.wilddogio.com/'}sites/${pageURL}.json`;
        Vue.http.post(wfAnalyticsURL, Object.assign({}, data, { pageTitle }));
      });
  },
  mounted() {
    // hide lodaing modal
    const wfLoadingModalEle = document.getElementById('wf-loading-modal');
    if (wfLoadingModalEle) {
      wfLoadingModalEle.style.display = 'none';
    }
    bus.windowWidth = this.$el.offsetWidth;
    this.observer = elementResizeDetectorMaker();
    this.observer.listenTo(this.$el, () => {
      bus.windowWidth = this.$el.offsetWidth;
    });
  },
  watch: {
    banData(newVal) {
      this.banList = newVal.map((item) => item['.key'].replace(/-/g, '.'));
      this.checkBanState();
    },
  },
  methods: {
    /**
     * ↓When auth state is changed, `this.user` is updated
     *  accordingly. If a user signs in, it retrieves user
     *  data from db (different from the auth `user` object).
     */
    listenToAuthStateChange() {
      butler.auth.onAuthStateChanged((user) => {
        if (!user) {
          bus.user = null;

          PHM.afterEvent('signOut', { user: null });
          return;
        }
        butler.db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
          const userData = snapshot.val();
          bus.user = Object.assign(
            {},
            userData,
            { uid: user.uid, isAdmin: userData.isAdmin || false },
          );

          PHM.afterEvent('signIn', { user: bus.user });

          this.checkBanState();
        });
      });
    },
    /**
     * ↓This keeps the comments up to realtime. It also
     *  watches `commentsCount` node in order to get the
     *  correct discussion count.
     */
    listenToCommentsFromDatabase() {
      this.commentsLoadingState = 'loading';
      const { pageURL } = butler.config;

      this.$bindAsArray('comments', butler.db
        .ref('comments').orderByChild('pageURL').equalTo(pageURL), err => {
        this.commentsLoadingState = 'failed';
        this.pageCommentsCount = 0;
        bus.discussionCount = 0;

        // Handle Wilddog `too many connections` error
        if (err.code === 26107) {
          if (butler.config.standbyDatabaseConfigs.length !== 0) {
            this.$Message.warning({
              content: butler.i18next.t('common.reset_when_wilddog_too_many_connections'),
              duration: 5,
            });
            if (!window.$_wildfire_reset) {
              this.$Message.error({
                content: butler.i18next.t('common.wildfire_reset_not_found'),
                duration: 3,
              });
            } else {
              window.$_wildfire_reset(null, err);
            }
          } else {
            this.$Message.error({
              content: butler.i18next.t('common.wilddog_too_many_connections'),
              duration: 3,
            });
          }

        }
      }, () => {
        this.commentsLoadingState = 'finished';
      });
    },
    listenToPluginCenter() {
      Vue.http.get(PLUGIN_LIST_CDN)
        .then(({ data: pluginList }) => {
          butler.db.ref('addedPluginsFromCenter').orderByValue().equalTo(true).on('child_added', snapshot => {
            const pluginId = getKey(snapshot);
            const script = document.createElement('script');
            script.src = pluginList[pluginId];
            script.onload = () => {
              injectPlugin(pluginId);
            };
            script.onerror = (error) => {
              console.error(error);
              this.$Message.error(butler.i18next.t('Wildfire.error.loading_plugin'));
            }
            document.head.appendChild(script);
          });
        })
        .catch((error) => {
          console.error(error);
          this.$Message.error(this.t('Wildfire.error.loading_plugin_list'));
        })
      butler.db.ref('addedPluginsFromCenter').on('child_changed', snapshot => {
        const pluginId = getKey(snapshot);
        if (!snapshot.val()) ejectPlugin(pluginId);
      });
      butler.db.ref('addedPluginsFromCenter').on('child_removed', snapshot => {
        const pluginId = getKey(snapshot);
        ejectPlugin(pluginId);
      });
    },
    checkBanState() {
      const isBanned = (bus.user && this.banList.indexOf(bus.user.uid) > -1) ||
        this.banList.indexOf(bus.info.ip) > -1;
      bus.info = Object.assign({}, bus.info, { isBanned });
    },
  },
};
</script>
