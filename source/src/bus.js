import Vue from 'vue'
const Bus = new Vue({
  data () {
    return {
      // Mention:
      isLoadingUserData: true,
      users: [],
      currentReplyAreaId: null,
      shouldShowMentionAutoComplete: false,
      mentioningUsername: ''
      // End
    }
  }})
export default Bus
