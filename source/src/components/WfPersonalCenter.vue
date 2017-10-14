<template >
  <Tabs value="msg-box">
    <TabPane label="系统消息" name="msg-box">
      <ul class="msg-list" v-for="msg in msgs">
        <li>
          <span class="meta">三分钟前</span>
          <span class="content"><a href="#">mrliao</a> 回复了<a href="#">你的评论</a>并 @ 了你。<a href="#">查看详情</a></span>
        </li>
        <li>
          <span class="meta">两小时前</span>
          <span class="content"><a href="#">mrliao</a> 参与了<a href="#">你的评论</a>的讨论。<a href="#">查看详情</a></span>
        </li>
        <li>
          <span class="meta">两小时前</span>
          <span class="content"><a href="#">mrliao</a> 参与了<a href="#">你的评论</a>的讨论。<a href="#">查看详情</a></span>
        </li>
        <li>
          <span class="meta">两小时前</span>
          <span class="content"><a href="#">mrliao</a> 参与了<a href="#">你的评论</a>的讨论。<a href="#">查看详情</a></span>
        </li>
        <li>
          <span class="meta">两小时前</span>
          <span class="content"><a href="#">mrliao</a> 参与了<a href="#">你的评论</a>的讨论。<a href="#">查看详情</a>很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长</span>
        </li>
      </ul>
      <span v-show="msgs.length === 0">暂无消息</span>
    </TabPane>
    <TabPane label="历史记录" name="history">
    </TabPane>
  </Tabs>
</template>

<script>
export default {
  name: 'wf-personal-center',
  props: ['user'],
  data () {
    return {
      msgs: []
    }
  },
  created () {
    const uid = this.user.uid
    this.$bindAsArray('msgs', this.$database
    .ref(`message/${uid}`).orderByChild('order'), () => {
      // failed
    }, () => {
      // succeeded
    })
  }
}
</script>

<style scoped>
.msg-list li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding: 0 16px;
}
.msg-list li span.meta {
  line-height: 2em;
  font-size: 0.8em;
  margin-right: 16px;
  color: #656c7a;
}
.msg-list li span.content {
  flex: 1;
  text-align: left;
}
</style>
