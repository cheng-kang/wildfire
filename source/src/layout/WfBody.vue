<template>
  <section>
    <wf-reply-area 
      :user="user" 
      :commentsLoadingState="commentsLoadingState"
      :page-comments-count="pageCommentsCount"
      :isMain="true"></wf-reply-area>
    <template v-if="comments.length !== 0">
      <ul class="wf-comment-group">
        <wf-comment-card 
          v-for="(comment, idx) in currentPageCommentsWithDotKey"
          :key="comment['.key']"
          :user="user"
          :comment="objectWithDotKey(comment, comment['.key'])"
          :page-comments-count="pageCommentsCount"
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
        :defaultSlotStyle="{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
          }">
          <i-icon type="load-c" size=18 class="spin-icon" :style="{marginRight: '5px'}"></i-icon>
          <div>{{$i18next.t('text/loadingComments')}}</div>
      </i-spin>
      <span v-if="commentsLoadingState === 'finished'">
        {{$i18next.t('text/postTheFirstComment')}}
      </span>
      <span v-if="commentsLoadingState === 'failed'" class="error">
        {{$i18next.t('error/failedToLoadComments')}}
      </span>
    </p>
    <i-modal
      v-model="shouldShowMentionAutoComplete"
      width="330"
      style="text-align: center;"
      :closable="false"
      :footer-hide="true">
      <i-auto-complete
        v-model="mentioningUsername"
        :autofocus="true"
        icon="ios-search"
        :placeholder="$i18next.t('text/mentionAutocompletePlaceholder')"
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
import Bus from '../bus'
import WfReplyArea from '../components/WFReplyArea'
import WfCommentCard from '../components/WFCommentCard'
import WfCommentUserinfoModal from '../components/WfCommentUserinfoModal'
export default {
  name: 'wf-body',
  components: { WfReplyArea, WfCommentCard, WfCommentUserinfoModal },
  props: ['user', 'comments', 'commentsLoadingState', 'pageCommentsCount'],
  data () {
    return {
      numberOfCommentsPerPage: 10,
      currentPage: 1,
      shouldShowMentionAutoComplete: false,
      mentioningUsername: '',
      shouldShowCommentUserModal: false
    }
  },
  computed: {
    currentPageComments () {
      return this.comments.slice((this.currentPage - 1) * this.numberOfCommentsPerPage, this.currentPage * this.numberOfCommentsPerPage)
    },
    currentPageCommentsWithDotKey () {
      return this.currentPageComments.map((comment) => {
        return Object.assign({replies: {}},
          comment,
          {'.key': comment['.key']}
        )
      })
    },
    mentioningUserAutoComplete () {
      if (!this.mentioningUsername) { return [] }
      return Bus.$data.users.filter(user => {
        return user.displayName.toLowerCase().indexOf(this.mentioningUsername.toLowerCase()) !== -1
      })
    }
  },
  created () {
    this.$database.ref('/users').once('value').then(snapshot => {
      const result = snapshot.val() || {}
      Bus.$data.users = Object.keys(result).map(id => {
        const { displayName, photoURL, email } = result[id]
        return {
          id,
          displayName,
          photoURL,
          email
        }
      })
      Bus.$data.isLoadingUserData = false
    })
    Bus.$on('ShowMentionAutoComplete', id => {
      Bus.$data.currentReplyAreaId = id
      this.shouldShowMentionAutoComplete = true
    })
    Bus.$on('ShowUserInfo', data => {
      if (typeof data === 'object') {
        this.$set(Bus.$data, 'selectedCommentUserInfo', data)
      } else {
        this.$database.ref('/users').orderByChild('email').equalTo(data).once('value', snapshot => {
          const res = snapshot.val()
          console.log(res)
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
    objectWithDotKey (obj, key) {
      return Object.assign({}, obj, {'.key': key})
    },
    pageChanged (newPage) {
      this.currentPage = newPage
    },
    mentionAutoCompleteOnSelect (value) {
      this.shouldShowMentionAutoComplete = false
      this.mentioningUsername = ''
      let selectedUser = JSON.parse(value)
      const formattedMentionText = `[@${selectedUser.displayName}](${selectedUser.email}) `

      Bus.$emit('MentionAutoCompleteSelected-' + Bus.$data.currentReplyAreaId, formattedMentionText)
    }
  }
}
</script>

<style scoped>
ul.wf-reply-group {
  padding-left: 60px;
}
.no-content-tip {
  display: flex;
  justify-content: center;
  align-items: center;
}
.error {
  color: #ed3f14;
}
.ivu-page {
  text-align: center;
}
.mention-option {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.mention-option img {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}
.mention-option span:nth-of-type(1) {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mention-option span:nth-of-type(2) {
  margin-left: 20px;
  font-style: italic;
}
</style>