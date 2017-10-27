<template>
  <header>
    <i-menu
      ref="statusMenu"
      mode="horizontal"
      theme="light"
      active-name="1"
      @on-select="menuOnSelect">
      <i-menu-item name="1">
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

      <a class="wf-nav-username" :title="username" @click="showUserSettingModal">
        {{shortenedUsername(username)}}
      </a>
      <i-submenu name="3" v-if="user">
        <template slot="title"></template>
        <i-menu-group :title="$i18next.t('Header.menu.personal_center')">
          <i-menu-item name="3-1">{{$i18next.t('Header.menu.notification')}}</i-menu-item>
        </i-menu-group>
        <i-menu-group :title="$i18next.t('Header.menu.admin_center')" v-if="user && user.isAdmin">
          <i-menu-item name="3-3">{{$i18next.t('Header.menu.report_management')}}</i-menu-item>
        </i-menu-group>
      </i-submenu>
      <div class="wf-nav-right">
        <template v-if="!user" >
          <a @click="showSignFormModal('signUp')">
            {{$i18next.t('Header.btn.sign_up')}}
          </a>
          /
          <a @click="showSignFormModal('signIn')">
            {{$i18next.t('Header.btn.sign_in')}}
          </a>
        </template>

        <a v-else @click="signOut">
          {{$i18next.t('Header.btn.sign_out')}}
        </a>
      </div>
    </i-menu>

    <i-modal
      v-model="signFormModal"
      :closable="false"
      :footer-hide="true"
      class-name="vertical-center-modal">
      <div style="text-align:center">
        <wf-auth-form :init-tab="signFormInitTab"></wf-auth-form>
      </div>
    </i-modal>

    <i-modal
      v-model="userSettingModal"
      :closable="false"
      :footer-hide="true"
      class-name="vertical-center-modal">
      <div style="text-align:center">
        <wf-user-setting :user="user" v-if='!!user'></wf-user-setting>
      </div>
    </i-modal>
    <i-modal v-model="personalCenterModal" :closable="false" :footer-hide="true">
      <div style="text-align:center">
        <wf-personal-center :user="user" v-if="user"></wf-personal-center>
      </div>
    </i-modal>
    <i-modal v-model="reportMangementModal" :closable="false" :footer-hide="true">
      <div style="text-align:center">
        <wf-report-management :user="user" v-if='user && user.isAdmin'></wf-report-management>
      </div>
    </i-modal>
  </header>
</template>

<script>
import WfAuthForm from '../components/WfAuthForm'
import WfUserSetting from '../components/WfUserSetting'
import WfPersonalCenter from '../components/WfPersonalCenter'
import WfReportManagement from '../components/WfReportManagement'

export default {
  name: 'wf-header',
  props: [
    'user',
    'discussionCount',
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
      signFormModal: false,
      userSettingModal: false,
      signFormInitTab: 'signIn',
      personalCenterModal: false,
      reportMangementModal: false,
      isAdmin: false
    }
  },
  computed: {
    username () {
      return this.user
      ? this.user.displayName
      : this.$i18next.t('common.anonymous_user')
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
    showSignFormModal (which) {
      this.signFormInitTab = which
      this.signFormModal = true
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
      if (name === '3-1') {
        this.personalCenterModal = true
      } else if (name === '3-3') {
        this.reportMangementModal = true
      }
    }
  }
}
</script>

<style scoped>
header { margin-bottom: 30px; }
.wf-nav-right { float: right; }
.wf-nav-username { display: inline-block; margin: 0 20px; padding: 0 20px; float: left;}
</style>
