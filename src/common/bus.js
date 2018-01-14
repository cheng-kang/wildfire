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
      windowWidth: 0,
      discussionCount: 0,
      /* Mention */
      isLoadingUserData: true,
      info: {ip: 'unknown', isBanned: false},
      user: null,
      users: [],
      admin: null,
      currentReplyAreaId: null,
      /* End of: Mention */

      /*
        Comment User Modal
          Note: This is the modal that shows when you click
                on username or @username in comment card
       */
      selectedCommentUserInfo: {},
      /* End of: Comment User Modal */
      // For plugin data
      plugins: {}
    }
  },
  computed: {
    isCurrentUserBanned () {
      return this.info.isBanned
    }
  },
  methods: {
    /**
     * listenTo:
     *   a replacement for `vm.$on`
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
        if (!this._events[event]) return this
        const cbIdx = this._events[event].findIndex(cb => cb._uid === identifier)
        this._events[event].splice(cbIdx, 1)
        return this
      }

      if (callback) {
        return this.$off(event, callback)
      }

      return this.$off(event)
    },
    filteredBus (eventName) {
      // TODO:
      // 由于bus内部的变量涉及太多全局的状态，所以与事件无关的内部的变量需要被过滤，
      // 尤其是events变量（之前的hooks），包含其他插件的事件函数，不可以允许被修改。
      return Bus
    }
  }
})
export default Bus
