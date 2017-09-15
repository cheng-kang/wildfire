<template>
  <section>
    <wf-reply-area 
      :user="user" 
      :commentsLoadingState="commentsLoadingState"
      :page-comments-count="pageCommentsCount"></wf-reply-area>
    <ul class="wf-comment-group" v-if="comments.length !== 0">
      <wf-comment-card 
        v-for="(comment, idx) in comments"
        :key="comment['.key']"
        :user="user"
        :comment="objectWithDotKey(comment, comment['.key'])"
        :page-comments-count="pageCommentsCount"
        ></wf-comment-card>
    </ul>
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
  methods: {
    objectWithDotKey (obj, key) {
      return Object.assign({}, obj, {'.key': key})
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
</style>