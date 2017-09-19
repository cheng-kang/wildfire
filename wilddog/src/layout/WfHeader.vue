<template>
  <header>
    <i-menu mode="horizontal" theme="light" active-name="1">
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
      <i-menu-item name="2">
          {{username}}
      </i-menu-item>
      <div class="wf-nav-right">
        <a v-if="!user" 
          @click="signUpFormModal = true">
          {{$i18next.t('button/signUp')}} | {{$i18next.t('button/signIn')}}
        </a>

        <a v-else
          @click="signOut">
          {{$i18next.t('button/signOut')}}
        </a>
      </div>
    </i-menu>
    <i-modal v-model="signUpFormModal" :closable="false">
      <div style="text-align:center">
        <wf-sign-form></wf-sign-form>
      </div>
      <div slot="footer"></div>
    </i-modal>
  </header>
</template>

<script>
import WfSignForm from '../components/WfSignForm'

export default {
  name: 'wf-header',
  props: ['user', 'discussionCount', 'commentsLoadingState'],
  components: { WfSignForm },
  data () {
    return {
      signUpFormModal: false
    }
  },
  computed: {
    username () {
      return this.user
      ? this.user.displayName
      : this.$i18next.t('text/anonymousUser')
    }
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
        onOk: () => {
          this.$wilddog.auth().signOut().then(() => {
            console.log('Wilddog User Sign Out.')
          })
        },
        onCancel: () => {
          console.log('Aborted Sign Out.')
        }
      })
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
</style>
<style>
.ivu-spin-text div {
  display: inline-block;
}
</style>