/*
  This is a shared state manager & event handler.

  Usage:
    ```
    import Bus from 'pathTo/bus.js'
    ```

    1. To reference shared state
      ```
      Bus.$data.dataName
      ```

    2. To broadcast a event
      ```
      Bus.$emit('eventName'[, params])
      ```

    3. To observe a event
      ```
      Bus.$on('eventName`[, params => {
        your callback
      }])
      ```
 */
import Vue from 'vue'
const Bus = new Vue({
  data () {
    return {
      /*
        Mention
       */
      isLoadingUserData: true,
      users: [],
      admin: null,
      currentReplyAreaId: null,
      /*
        End of: Mention
       */

      /*
        Comment User Modal
          Note: This is the modal that shows when you click
                on username or @username in comment card
       */
      selectedCommentUserInfo: {}
      /*
        End of: Comment User Modal
       */
    }
  }
})
export default Bus
