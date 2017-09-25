<template>
  <header>
    <i-menu ref="statusMenu" mode="horizontal" theme="light" active-name="1" >
      <i-menu-item name="1">
        <i-spin v-if="commentsLoadingState === 'loading'"
          :defaultSlotStyle="{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
            }">
            <i-icon type="load-c" size=18 class="spin-icon" :style="{marginRight: '5px'}"></i-icon>
            <div>{{$i18next.t('text/loading')}}</div>
        </i-spin>
        <span v-else>{{discussionCount}} {{$i18next.t('button/discussions')}}</span>
      </i-menu-item>
      <a class="wf-nav-username" @click="showUserSettingModal">
        {{username}}
      </a>
      <div class="wf-nav-right">
        <template v-if="!user" >
          <a @click="showSignFormModal('signUp')">
            {{$i18next.t('button/signUp')}}
          </a>
          /
          <a @click="showSignFormModal('signIn')">
            {{$i18next.t('button/signIn')}}
          </a>
        </template>

        <a v-else
          @click="signOut">
          {{$i18next.t('button/signOut')}}
        </a>
      </div>
    </i-menu>
    <i-modal v-model="signFormModal" :closable="false" :footer-hide="true">
      <div style="text-align:center">
        <wf-sign-form :init-tab="signFormInitTab"></wf-sign-form>
      </div>
    </i-modal>
    <i-modal v-model="userSettingModal" :closable="false" :footer-hide="true">
      <div style="text-align:center">
        <wf-user-setting :user="user" v-if='!!user'></wf-user-setting>
      </div>
    </i-modal>
  </header>
</template>

<script>
import Bus from '../bus'
import WfSignForm from '../components/WfSignForm'
import WfUserSetting from '../components/WfUserSetting'

export default {
  name: 'wf-header',
  props: ['user', 'discussionCount', 'commentsLoadingState'],
  components: { WfSignForm, WfUserSetting },
  data () {
    return {
      signFormModal: false,
      userSettingModal: false,
      signFormInitTab: 'signIn'
    }
  },
  computed: {
    username () {
      return this.user
      ? this.user.displayName
      : this.$i18next.t('text/anonymousUser')
    }
  },
  created () {
    Bus.$on('CurrentUserInfoUpdated', updates => {
      this.user.displayName = updates['/displayName']
      this.user.photoURL = updates['/photoURL']
    })
  },
  methods: {
    signUp () {
      this.$Modal.confirm({
        render: (h) => {
          return h('wf-sign-up-form')
        }
      })
    },
    signOut () {
      this.$Modal.confirm({
        title: this.$i18next.t('text/signOutTitle'),
        content: `<p> ${this.$i18next.t('text/signOutConfirmText')} </p>`,
        okText: this.$i18next.t('text/confirm'),
        cancelText: this.$i18next.t('button/cancel'),
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
          title: this.$i18next.t('text/pleaseSignIn'),
          content: this.$i18next.t('text/unSignInWarning'),
          okText: this.$i18next.t('text/confirm')
        })
      }
    }
  }
}
</script>

<style scoped>
header {
  margin-bottom: 30px;
}
.wf-nav-right {
  float: right;
}
.wf-nav-username {
  display: inline-block;
  padding:0 20px;
  margin:0 20px;
/*  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;*/
}
</style>
<style>
.ivu-spin-text div {
  display: inline-block;
}
</style>