<template>
  <div :class="classes">
    <template
      v-if="pluginComponents['header.before']">
      <component
        v-for="(module, cpntName) in pluginComponents['header.before']"
        :is="cpntName"
        :key="cpntName"
        :t="pluginTranslate(module)">
      </component>
    </template>
    <wf-header :comments-loading-state="commentsLoadingState"/>

    <template
      v-if="pluginComponents['header.after']">
      <component
        v-for="(module, cpntName) in pluginComponents['header.after']"
        :is="cpntName"
        :key="cpntName"
        :t="pluginTranslate(module)">
      </component>
    </template>
    <wf-body
      :page-comments-count="pageCommentsCount"
      :comments="commentsWithId"
      :comments-loading-state="commentsLoadingState"/>
    <template
      v-if="pluginComponents['header.after']">
      <component
        v-for="(module, cpntName) in pluginComponents['header.after']"
        :is="cpntName"
        :key="cpntName"
        :t="pluginTranslate(module)">
      </component>
    </template>
    <wf-footer/>
  </div>
</template>

<script>
import Vue from 'vue';
import elementResizeDetectorMaker from 'element-resize-detector';
import Bus from './common/bus';
import WfHeader from './layout/WfHeader';
import WfBody from './layout/WfBody';
import WfFooter from './layout/WfFooter';
import { afterEvent } from './utils';

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
    bus: () => Bus,
    auth: () => Bus.auth,
    config: () => Bus.config,
    db: () => Bus.db,
    user: () => Bus.user,
    i18next: () => Bus.i18next,
    pluginTranslate: () => Bus.pluginTranslate,
    pluginComponents: () => Bus.pluginComponents,
    classes() {
      return [
        'wf',
        `wf-theme-${this.config.theme}`,
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
    /*
      `CurrentUserInfoUpdated` event observer
      Note: this observer watches user profile updates
            and change accordingly. The change here will
            affect all child components.
     */
    Bus.$on('CurrentUserInfoUpdated', updates => {
      Bus.user = Object.assign({}, Bus.user, {
        displayName: updates['/displayName'],
        photoURL: updates['/photoURL'],
      });
    });

    this.$bindAsArray('banData', this.db.ref('ban'));

    Vue.http.get('https://api.userinfo.io/userinfos')
      .then(response => {
        Bus.$data.info = Object.assign({}, Bus.$data.info, { ip: response.data.ip_address });
        this.checkBanState();
        return response.data;
      })
      .catch(error => {
        console.error(error);
        Bus.$data.info = Object.assign({}, Bus.$data.info, { ip: 'unknown' });
      })
      .then(data => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') { return; }
        const { pageURL, pageTitle, databaseProvider } = this.config;
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
    Bus.$data.windowWidth = this.$el.offsetWidth;
    this.observer = elementResizeDetectorMaker();
    this.observer.listenTo(this.$el, () => {
      Bus.$data.windowWidth = this.$el.offsetWidth;
    });
    Bus.$on('pluginUpdate', () => {
      this.$forceUpdate();
    });
  },
  watch: {
    banData(newVal) {
      this.banList = newVal.map((item) => item['.key'].replace(/-/g, '.'));
      this.checkBanState();
    },
  },
  methods: {
    /*
      Auth state observer
      Note: when auth state is changed, `this.user` is updated
            accordingly. If a user signs in, it retrieves user
            data from db (different from the auth `user`
            object).
     */
    listenToAuthStateChange() {
      this.auth.onAuthStateChanged((user) => {
        if (!user) {
          Bus.user = null;
          // event: authStateChanged
          afterEvent('authStateChanged', { user: null }, this.bus);
          return;
        }
        this.db.ref(`users/${user.uid}`).once('value').then((snapshot) => {
          const userData = snapshot.val();
          Bus.user = Object.assign(
            {},
            userData,
            { uid: user.uid, isAdmin: userData.isAdmin || false },
          );

          // event: authStateChanged
          afterEvent('authStateChanged', { user: this.user }, this.bus);

          this.checkBanState();
        });
      });
    },
    /*
      Comments observer
      Note: this keeps the comments up-to-realtime. It also
            watches `commentsCount` node in order to get the
            correct discussion count.
     */
    listenToCommentsFromDatabase() {
      this.commentsLoadingState = 'loading';
      const { pageURL } = this.config;

      this.$bindAsArray('comments', this.db
        .ref('comments').orderByChild('pageURL').equalTo(pageURL), err => {
        this.commentsLoadingState = 'failed';
        this.pageCommentsCount = 0;
        Bus.$data.discussionCount = 0;

        // Handle Wilddog `too many connections` error
        if (err.code === 26107) {
          if (this.config.standbyDatabaseConfigs.length !== 0) {
            this.$Message.warning({
              content: this.i18next.t('common.reset_when_wilddog_too_many_connections'),
              duration: 5,
            });
            if (!window.$_wildfire_reset) {
              this.$Message.error({
                content: this.i18next.t('common.wildfire_reset_not_found'),
                duration: 3,
              });
            } else {
              window.$_wildfire_reset(null, err);
            }
          } else {
            this.$Message.error({
              content: this.i18next.t('common.wilddog_too_many_connections'),
              duration: 3,
            });
          }

        }
      }, () => {
        this.commentsLoadingState = 'finished';
      });
    },
    listenToPluginCenter() {
      this.db.ref('pluginCenter').on('value', (snapshot) => {
        const pluginCenter = snapshot.val() || {};

        // 注册插件（加载、生成对象）
        // 如果已开启的，则直接激活生效，否则不激活
        this.bus.registerPlugins(pluginCenter);
      }, (error) => {
        console.log(error);
        this.$Message.error(this.i18next.t('Wildfire.error.loading_plugins'));
      });
    },
    checkBanState() {
      const isBanned = (Bus.user && this.banList.indexOf(Bus.user.uid) > -1) ||
        this.banList.indexOf(Bus.$data.info.ip) > -1;
      Bus.$data.info = Object.assign({}, Bus.$data.info, { isBanned });
    },
  },
};
</script>
