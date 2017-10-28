<template>
  <section>
    <wf-reply-area
      :user="user"
      :comments-loading-state="commentsLoadingState"
      style="margin-bottom: 30px;"
      :isMain="true"></wf-reply-area>

    <template v-if="comments.length !== 0">
      <ul class="wf-comment-group">
        <wf-comment-card
          v-for="(comment, idx) in currentPageComments"
          :key="comment.commentId"
          :user="user"
          :comment="comment"
          :comments-loading-state="commentsLoadingState"
          ></wf-comment-card>
      </ul>
      <i-page
        :total="pageCommentsCount"
        v-if="pageCommentsCount > 10"
        size="small"
        @on-change="pageChanged"></i-page>
    </template>

    <p v-else class="no-content-tip">
      <i-spin v-if="commentsLoadingState === 'loading'"
        :default-slot-style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }">
          <i-icon class="spin-icon" type="load-c" size="18" :style="{marginRight: '5px'}"></i-icon>
          <div>{{$i18next.t('Body.text.loading_comments')}}</div>
      </i-spin>
      <span v-if="commentsLoadingState === 'finished'">
        {{$i18next.t('Body.text.post_the_first_comment')}}
      </span>
      <span v-if="commentsLoadingState === 'failed'" class="error">
        {{$i18next.t('Body.text.loading_comments_failed')}}
      </span>
    </p>

    <i-modal
      v-model="shouldShowMentionAutoComplete"
      width="330"
      style="text-align: center;"
      :closable="false"
      :footer-hide="true">
      <i-auto-complete
        ref="mentionAutoComplete"
        v-model="mentioningUsername"
        icon="ios-search"
        :placeholder="$i18next.t('Body.placeholder.mention_autocomplete')"
        style="width:300px"
        @on-select="mentionAutoCompleteOnSelect">

        <i-option v-for="user in mentioningUserAutoComplete" :value="JSON.stringify(user)" :key="user.id">
          <div class="mention-option">
            <img :src="user.photoURL">
            <span>{{ user.displayName }}</span>
            <span>{{ user.email }}</span>
          </div>
        </i-option>

      </i-auto-complete>
    </i-modal>

    <i-modal
      v-model="shouldShowCommentUserModal"
      :closable="false"
      :footer-hide="true"
      class-name="vertical-center-modal">
      <wf-comment-userinfo-modal></wf-comment-userinfo-modal>
    </i-modal>
  </section>
</template>

<script>
import Vue from 'vue'
import Bus from '../common/bus'
import WfReplyArea from '../components/WfReplyArea'
import WfCommentCard from '../components/WfCommentCard'
import WfCommentUserinfoModal from '../components/WfCommentUserinfoModal'
export default {
  name: 'wf-body',
  components: {
    WfReplyArea,
    WfCommentCard,
    WfCommentUserinfoModal
  },
  props: [
    'user',
    'comments',
    'commentsLoadingState',
    'pageCommentsCount'
  ],
  data () {
    return {
      numberOfCommentsPerPage: 10,
      currentPage: 1,
      /*
        Mention
       */
      shouldShowMentionAutoComplete: false,
      mentioningUsername: '',
      /*
        End of: Mention
       */
      /*
        Comment User Modal
       */
      shouldShowCommentUserModal: false
      /*
        End of: Comment User Modal
       */
    }
  },
  computed: {
    currentPageComments () {
      const start = (this.currentPage - 1) * this.numberOfCommentsPerPage
      const end = this.currentPage * this.numberOfCommentsPerPage
      return this.comments.slice(start, end)
    },
    mentioningUserAutoComplete () {
      if (!this.mentioningUsername) { return [] }
      return Bus.$data.users.filter(user => {
        const usernameLC = user.displayName.toLowerCase()
        const emailLC = user.email.toLowerCase()
        const mentioningUsernameLC = this.mentioningUsername.toLowerCase()
        return usernameLC.indexOf(mentioningUsernameLC) !== -1 || emailLC.indexOf(mentioningUsernameLC)
      })
    }
  },
  created () {
    /*
      Format users data for Mention auto complete
     */
    this.$database.ref('/users').once('value').then(snapshot => {
      const result = snapshot.val() || {}
      Bus.$data.users = Object.keys(result).map(id => {
        const { displayName, photoURL, email, isAdmin } = result[id]
        if (isAdmin) {
          Bus.$data.admin = { uid: id, displayName, photoURL, email }
        }
        return {
          uid: id,
          displayName,
          photoURL,
          email
        }
      })
      Bus.$data.isLoadingUserData = false
    })

    /*
      `ShowMentionAutoComplete` event observer
      Note: shows Mention auto complete modal when needed.
            It saves the uid of the current active reply
            area for later use (to specify reciever of
            `MentionAutoCompleteSelected-${id}` event)
     */
    Bus.listenTo('ShowMentionAutoComplete', id => {
      Bus.$data.currentReplyAreaId = id
      this.shouldShowMentionAutoComplete = true
      Vue.nextTick(() => {
        this.$refs.mentionAutoComplete.$refs.input.focus()
      })
    })

    /*
      `ShowUserInfo` event observer
      Note: shows user info modal which displays selected
            user information. If the param type is not `object`,
            retrieve user data with the passed param (which
            should be the email of the user).
     */
    Bus.listenTo('ShowUserInfo', data => {
      if (typeof data === 'object') {
        this.$set(Bus.$data, 'selectedCommentUserInfo', data)
      } else {
        this.$database.ref('/users').orderByChild('email').equalTo(data).once('value', snapshot => {
          const res = snapshot.val()
          if (res) {
            const uid = Object.keys(res)[0]
            const userByEmail = res[uid]
            this.$set(Bus.$data, 'selectedCommentUserInfo', {
              uid: uid,
              displayName: userByEmail.displayName,
              photoURL: userByEmail.photoURL,
              email: userByEmail.email
            })
          }
        })
      }
      this.shouldShowCommentUserModal = true
    })
  },
  methods: {
    pageChanged (newPage) {
      this.currentPage = newPage
    },
    mentionAutoCompleteOnSelect (value) {
      this.shouldShowMentionAutoComplete = false
      this.mentioningUsername = ''
      let selectedUser = JSON.parse(value)
      const formattedMentionText = `[@${selectedUser.displayName}](${selectedUser.email}) `

      /*
        Broadcast auto complete selection
        Note: a uid suffix is included in the event
              name to specify the reciever.
       */
      Bus.$emit('MentionAutoCompleteSelected-' + Bus.$data.currentReplyAreaId, formattedMentionText)
    }
  }
}
</script>

<style scoped>
ul.wf-reply-group { padding-left: 60px; }
.no-content-tip { display: flex; justify-content: center; align-items: center; }
.error { color: #ed3f14; }
.ivu-page { text-align: center; }
.mention-option { display: flex; flex-direction: row; align-items: center; }
.mention-option img { width: 18px; height: 18px; margin-right: 10px; }
.mention-option span:nth-of-type(1) { overflow: hidden; max-width: 120px; text-overflow: ellipsis; }
.mention-option span:nth-of-type(2) { font-style: italic; margin-left: 20px; }
</style>
