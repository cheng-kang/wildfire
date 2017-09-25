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
  </section>
</template>

<script>
import WfReplyArea from '../components/WFReplyArea'
import WfCommentCard from '../components/WFCommentCard'
export default {
  name: 'wf-body',
  components: { WfReplyArea, WfCommentCard },
  props: ['user', 'comments', 'commentsLoadingState', 'pageCommentsCount'],
  data () {
    return {
      numberOfCommentsPerPage: 10,
      currentPage: 1
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
    }
  },
  methods: {
    objectWithDotKey (obj, key) {
      return Object.assign({}, obj, {'.key': key})
    },
    pageChanged (newPage) {
      this.currentPage = newPage
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
</style>