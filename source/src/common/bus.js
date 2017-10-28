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
  },
  methods: {
    /**
     * listenTo:
     *   a replacement for `vm.$of`
     * @param  {String|[String]}   event
     *         name(s) of new event listener(s)
     * @param  {Function} callback
     *         callback function for new event listener(s)
     * @param  {String|Number}   identifier
     *         custom identifier for cb
     * @return {Object}
     */
    listenTo (event, callback, identifier) {
      if (identifier) {
        Object.defineProperty(callback, '_uid', {
          value: identifier,
          writable: false,
          enumerable: true,
          configurable: true
        })
      }
      return this.$on(event, callback)
    },
    /**
     * enough:
     *     a replacement for `vm.$off`
     * @param  {String}   event
     *         name of the event to remove
     * @param  {Function} callback
     *         specific cb to remove
     * @param  {String|Number}   identifier
     *         custom identifier for cb
     * @return {Object}
     */
    enough (event, callback, identifier) {
      if (identifier) {
        const cbIdx = this._events[event].findIndex(cb => cb._uid === identifier)
        this._events[event].splice(cbIdx, 1)
        return this
      }

      if (callback) {
        return this.$off(event, callback)
      }

      return this.$off(event)
    }
  }
})
export default Bus
