<template>
  <header class="wf-header">
    <i-menu
      active-name="comments_count"
      mode="horizontal"
      @on-select="menuOnSelect">
      <i-menu-item name="comments_count" ref="first_menu_item">
        <i-spin v-if="commentsLoadingState === 'loading'"
          :default-slot-style="{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }">
          <i-icon
            type="load-c"
            size="18"
            class="spin-icon"
            :style="{marginRight: '5px'}"></i-icon>
          <div>
            {{$i18next.t('Header.text.loading')}}
          </div>
        </i-spin>

        <span v-else>
          {{discussionCount}} {{$i18next.t(discussionCount < 2 ? 'Header.btn.comment' : 'Header.btn.comments')}}
        </span>
      </i-menu-item>

      <li class="wf-nav-user" :title="username" @click="showUserSettingModal">
        <div v-if="isSmallerScreen && user">
          <img :src="user.photoURL">
        </div>
        <a v-if="!isSmallerScreen">
          {{shortenedUsername(username)}}
        </a>
      </li>
      <i-submenu name="more" v-if="user" :class="{ 'float-right': !isLargeScreen}" class="no-border-bottom">
        <template slot="title"></template>
        <template v-if="user">
          <i-menu-group :title="$i18next.t('Header.menu.personal_center')">
            <i-menu-item name="notification">{{$i18next.t('Header.menu.notification')}}</i-menu-item>
          </i-menu-group>
          <i-menu-group :title="$i18next.t('Header.menu.admin_center')" v-if="user && user.isAdmin">
            <i-menu-item name="report_management">{{$i18next.t('Header.menu.report_management')}}</i-menu-item>
          </i-menu-group>
          <i-menu-group :title="$i18next.t('Header.menu.more')" v-if="isSmallScreen">
            <i-menu-item name="sign_out">{{$i18next.t('Header.menu.sign_out')}}</i-menu-item>
          </i-menu-group>
        </template>
        <template v-if="isSmallScreen && !user">
          <i-menu-group :title="$i18next.t('Header.menu.actions')">
            <i-menu-item name="sign_up">{{$i18next.t('Header.menu.sign_up')}}</i-menu-item>
            <i-menu-item name="sign_in">{{$i18next.t('Header.menu.sign_in')}}</i-menu-item>
          </i-menu-group>
        </template>
      </i-submenu>
      <li class="float-right" v-if="!isSmallScreen || !user">
        <template v-if="!user" >
          <a @click="showAuthFormModal('sign_up')">
            {{$i18next.t('Header.btn.sign_up')}}
          </a>
          /
          <a @click="showAuthFormModal('sign_in')">
            {{$i18next.t('Header.btn.sign_in')}}
          </a>
        </template>
        <a v-else @click="signOut">
          {{$i18next.t('Header.btn.sign_out')}}
        </a>
      </li>
    </i-menu>

    <i-modal
      v-model="authFormModal"
      :closable="false"
      :footer-hide="true"
      :theme="$config.theme"
      class-name="wf-form">
      <div style="text-align:center">
        <wf-auth-form :init-tab="authFormInitTab"></wf-auth-form>
      </div>
    </i-modal>

    <i-modal
      v-model="userSettingModal"
      :closable="false"
      :footer-hide="true"
      :theme="$config.theme"
      class-name="wf-form">
      <div style="text-align:center">
        <wf-user-setting :user="user" v-if='!!user'></wf-user-setting>
      </div>
    </i-modal>
    <i-modal v-model="personalCenterModal" :closable="false" :footer-hide="true" :theme="$config.theme">
      <div style="text-align:center">
        <wf-personal-center :user="user" v-if="user"></wf-personal-center>
      </div>
    </i-modal>
    <i-modal v-model="reportMangementModal" :closable="false" :footer-hide="true" :theme="$config.theme">
      <div style="text-align:center">
        <wf-report-management :user="user" v-if='user && user.isAdmin'></wf-report-management>
      </div>
    </i-modal>
  </header>
</template>

<script>
import Bus from '../common/bus'
import WfAuthForm from '../components/WfAuthForm'
import WfUserSetting from '../components/WfUserSetting'
import WfPersonalCenter from '../components/WfPersonalCenter'
import WfReportManagement from '../components/WfReportManagement'

export default {
  name: 'wf-header',
  props: [
    'user',
    'commentsLoadingState'
  ],
  components: {
    WfAuthForm,
    WfUserSetting,
    WfPersonalCenter,
    WfReportManagement
  },
  data () {
    return {
      authFormInitTab: 'sign_in', // 'sign_in' || 'sign_up'
      authFormModal: false,
      userSettingModal: false,
      personalCenterModal: false,
      reportMangementModal: false,
      isAdmin: false,
      menuActiveName: 'comments_count'
    }
  },
  computed: {
    $auth () {
      return this.$_wf.auth
    },
    $config () {
      return this.$_wf.config
    },
    $i18next () {
      return this.$_wf.i18next
    },
    username () {
      return this.user
      ? this.user.displayName
      : this.$i18next.t('common.anonymous_user')
    },
    discussionCount: () => Bus.$data.discussionCount,
    windowWidth: () => Bus.$data.windowWidth,
    isSmallScreen () {
      // <= screen width of iPhone 6 plus
      return this.windowWidth <= 414
    },
    isSmallerScreen () {
      // screen width not wide enough for username to display
      return this.windowWidth <= 355
    },
    isLargeScreen () {
      return !this.isSmallScreen && !this.isSmallerScreen
    }
  },
  methods: {
    shortenedUsername (username) {
      if (username.length > 10) {
        return username.slice(0, 10) + '...'
      }
      return username
    },
    signOut () {
      this.$Modal.confirm({
        title: this.$i18next.t('Header.text.sign_out_confirm_title'),
        content: `<p> ${this.$i18next.t('Header.text.sign_out_confirm_content')} </p>`,
        okText: this.$i18next.t('Header.btn.confirm'),
        cancelText: this.$i18next.t('Header.btn.cancel'),
        onOk: () => {
          this.$auth.signOut().then(() => {
            console.log('User Sign Out.')
          })
        },
        onCancel: () => {
          console.log('Aborted Sign Out.')
        }
      })
    },
    showAuthFormModal (which) {
      this.authFormInitTab = which
      this.authFormModal = true
    },
    showUserSettingModal () {
      if (this.user) {
        this.userSettingModal = true
      } else {
        this.$Modal.warning({
          title: this.$i18next.t('Header.text.sign_in_warning_title'),
          content: this.$i18next.t('Header.text.sign_in_warning_content'),
          okText: this.$i18next.t('Header.btn.confirm')
        })
      }
    },
    menuOnSelect (name) {
      if (name === 'notification') {
        this.personalCenterModal = true
      } else if (name === 'report_management') {
        this.reportMangementModal = true
      } else if (name === 'sign_out') {
        this.signOut()
      } else if (name === 'sign_up' || name === 'sign_in') {
        this.showAuthFormModal(name)
      }
      if (name !== 'comments_count') {
        this.$refs.first_menu_item.handleClick()
      }
    }
  }
}
</script>
