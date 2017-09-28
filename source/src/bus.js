import Vue from 'vue'
const Bus = new Vue({
  data () {
    return {
      // Mention:
      isLoadingUserData: true,
      users: [],
      currentReplyAreaId: null
      // End
    }
  }})
export default Bus
