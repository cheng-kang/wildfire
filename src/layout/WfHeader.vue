<template>
  <header class="wf-header">
    <i-menu
      active-name="comments_count"
      mode="horizontal"
      @on-select="menuOnSelect">
      <i-menu-item name="comments_count" ref="first_menu_item">
        <span v-if="commentsLoadingState === 'loading'">
          <i-icon
            type="load-c"
            size="14"
            class="spin-icon"
            :style="{marginRight: '5px'}"></i-icon>
          {{t('Header.text.loading')}}
        </span>
        <span v-else>
          {{discussionCount}} {{t('Header.btn.comment', { count: discussionCount })}}
        </span>
      </i-menu-item>

      <li class="wf-nav-user" :title="username" @click="showUserSettingModal">
        <div v-if="isSmallerScreen && user">
          <img :src="user.photoURL"/>
        </div>
        <a v-if="!isSmallerScreen">
          {{shortenedUsername(username)}}
        </a>
      </li>
      <i-submenu v-if="isLargeScreen && user" name="more" class="wf-no-border-bottom">
        <!-- <span slot="title"></span> -->
        <i-menu-group :title="t('Header.menu.personal_center')">
          <i-menu-item name="user_setting">{{t('Header.menu.user_setting')}}</i-menu-item>
          <i-menu-item name="notification">{{t('Header.menu.notification')}}</i-menu-item>
          <!-- <component
            v-for="(cpntName, idx) in pluginComponents.menu.personal"
            :is="cpntName"
            :key="cpntName+idx"
            v-bind="pluginProps(cpntName)"/> -->
        </i-menu-group>
        <i-menu-group :title="t('Header.menu.admin_center')" v-if="user.isAdmin">
          <i-menu-item name="plugin_center">{{t('Header.menu.plugin_center')}}</i-menu-item>
          <i-menu-item name="report_management">{{t('Header.menu.report_management')}}</i-menu-item>
          <i-menu-item name="admin_helpers">{{t('Header.menu.admin_helpers')}}</i-menu-item>
          <!-- <component
            v-for="(cpntName, idx) in pluginComponents.menu.admin"
            :is="cpntName"
            :key="cpntName+idx"
            v-bind="pluginProps(cpntName)"/> -->
        </i-menu-group>
        <!-- <i-menu-group :title="t('Header.menu.plugin')" v-if="shouldShowPluginMenu">
          <component
            v-for="(cpntName, idx) in pluginComponents.menu.plugin"
            :is="cpntName"
            :key="cpntName+idx"
            v-bind="pluginProps(cpntName)"/>
        </i-menu-group> -->
      </i-submenu>
      <i-submenu v-if="isSmallScreen" name="more" class="wf-no-border-bottom wf-float-right">
        <i-menu-group :title="t('Header.menu.actions')">
          <i-menu-item v-if="user" name="sign_out">{{t('Header.menu.sign_out')}}</i-menu-item>
          <template v-else>
            <i-menu-item name="sign_up">{{t('Header.menu.sign_up')}}</i-menu-item>
            <i-menu-item name="sign_in">{{t('Header.menu.sign_in')}}</i-menu-item>
          </template>
        </i-menu-group>
      </i-submenu>
      <li class="wf-float-right" v-if="!isSmallScreen">
        <template v-if="!user" >
          <a @click="showAuthFormModal('sign_up')">
            {{t('Header.btn.sign_up')}}
          </a>
          /
          <a @click="showAuthFormModal('sign_in')">
            {{t('Header.btn.sign_in')}}
          </a>
        </template>
        <a v-else @click="signOut">
          {{t('Header.btn.sign_out')}}
        </a>
      </li>
    </i-menu>

    <i-modal v-model="authFormModal" :closable="false" :footer-hide="true" :theme="theme" class-name="wf-form">
      <wf-auth-form :init-tab="authFormInitTab"/>
    </i-modal>

    <i-modal v-if="user" v-model="userSettingModal" :closable="false" :footer-hide="true" :theme="theme" class-name="wf-form">
      <wf-user-setting :user="user"/>
    </i-modal>
    <i-modal v-if="user" v-model="personalCenterModal" :closable="false" :footer-hide="true" :theme="theme">
      <wf-personal-center :user="user"/>
    </i-modal>
    <i-modal  v-if="user && user.isAdmin" v-model="reportMangementModal" :closable="false" :footer-hide="true" :theme="theme">
      <wf-report-management :user="user"/>
    </i-modal>
    <i-modal v-if="user && user.isAdmin" v-model="adminHelpersModal" :closable="false" :footer-hide="true" :theme="theme">
      <wf-admin-helpers :user="user"/>
    </i-modal>
    <i-modal v-if="user && user.isAdmin" v-model="pluginCenterModal" :closable="false" :footer-hide="true" :theme="theme">
      <wf-plugin-center/>
    </i-modal>
  </header>
</template>

<script>
import { bus, butler } from '../common';
import { PCM, PHM, EVENTS, pluginProps, handlePluginHookError } from '../plugin';

export default {
  name: 'wf-header',
  props: [
    'commentsLoadingState',
  ],
  data() {
    return {
      authFormInitTab: 'sign_in', // 'sign_in' || 'sign_up'
      authFormModal: false,
      userSettingModal: false,
      personalCenterModal: false,
      reportMangementModal: false,
      adminHelpersModal: false,
      pluginCenterModal: false,
      menuActiveName: 'comments_count',
    };
  },
  computed: {
    pluginComponents: () => ({
      menu: {
        personal: PCM.get('menu.personal'),
        admin: PCM.get('menu.admin'),
        plugin: PCM.get('menu.plugin'),
      },
    }),
    pluginProps: () => pluginProps,
    t: () => (key) => butler.i18next.t(key),
    theme: () => butler.config.theme,
    user: () => bus.user,
    username() {
      return this.user
        ? this.user.displayName
        : this.t('common.anonymous_user');
    },
    discussionCount: () => bus.discussionCount,
    isSmallScreen() {
      // <= screen width of iPhone 6 plus
      return bus.windowWidth <= 414;
    },
    isSmallerScreen() {
      // screen width not wide enough for username to display
      return bus.windowWidth <= 355;
    },
    isLargeScreen() {
      return !this.isSmallScreen && !this.isSmallerScreen;
    },
    shouldShowPluginMenu() {
      return this.pluginComponents.menu.plugin.length > 0;
    },
  },
  methods: {
    shortenedUsername(username) {
      if (username.length > 10) {
        return `${username.slice(0, 10)}...`;
      }
      return username;
    },
    signOut() {
      this.$Modal.confirm({
        title: this.t('Header.text.sign_out_confirm_title'),
        content: `<p> ${this.t('Header.text.sign_out_confirm_content')} </p>`,
        okText: this.t('Header.btn.confirm'),
        cancelText: this.t('Header.btn.cancel'),
        onOk: () => {
          /**
           * Plugin Hook Event: signOut
           */
          PHM.beforeEvent(EVENTS.SIGN_OUT)
            .then(() => {
              butler.auth.signOut().then(() => {
                PHM.afterEvent(EVENTS.SIGN_OUT);
              }).catch(error => {
                PHM.afterEvent(EVENTS.SIGN_OUT, { error });
              });
            })
            .catch((error) => {
              handlePluginHookError(error);
            })
        },
      });
    },
    showAuthFormModal(which) {
      this.authFormInitTab = which;
      this.authFormModal = true;
    },
    showUserSettingModal() {
      if (this.user) {
        this.userSettingModal = true;
      } else {
        this.$Modal.warning({
          title: this.t('Header.text.sign_in_warning_title'),
          content: this.t('Header.text.sign_in_warning_content'),
          okText: this.t('Header.btn.confirm'),
        });
      }
    },
    menuOnSelect(name) {
      switch (name) {
        case 'user_setting': {
          this.userSettingModal = true;
          break;
        }
        case 'notification': {
          this.personalCenterModal = true;
          break;
        }
        case 'report_management': {
          this.reportMangementModal = true;
          break;
        }
        case 'admin_helpers': {
          this.adminHelpersModal = true;
          break;
        }
        case 'plugin_center': {
          this.pluginCenterModal = true;
          break;
        }
        case 'sign_out': {
          this.signOut();
          break;
        }
        case 'sign_up': {
          this.showAuthFormModal(name);
          break;
        }
        case 'sign_in': {
          this.showAuthFormModal(name);
          break;
        }
        default:
          break;
      }
      if (name !== 'comments_count') {
        this.$refs.first_menu_item.handleClick();
      }
    },
  },
  created() {
    butler.db.ref(`pageComments/${butler.config.pageURL}`).on('value', snapshot => {
      this.pageComments = snapshot.val() || {};
      bus.discussionCount = Object.keys(this.pageComments).length;
    });
  },
};
</script>
