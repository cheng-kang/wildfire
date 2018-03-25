import Vue from 'vue';
import cloneDeep from 'lodash/clonedeep';

/**
 * A shared state manager & event handler
 *
 * Usage:
 *  0. `import bus from 'pathTo/bus';`
 *  1. to reference a shared state: `bus.dataName`
 *  2. to broadcast a event: `bus.$emit('eventName'[, params])`
 *  3. to subscribe to a event: `bus.$on('eventName`[, callback])`
 */
const bus = new Vue({
  data() {
    return {
      windowWidth: 0,
      discussionCount: 0,
      isLoadingUserData: true,
      info: { ip: 'unknown', isBanned: false },
      user: null,
      users: [],
      admin: null,
      currentReplyAreaId: null,
      /**
       * ↓This is for the modal that shows when you
       *  click on username or @username in comment card
       */
      selectedCommentUserInfo: {},
      pluginsData: {},
    };
  },
  computed: {
    isCurrentUserBanned() {
      return this.info.isBanned;
    },
    /**
     * A deep copy of common data for plugins.
     */
    commonData() {
      return {
        windowWidth: this.windowWidth,
        discussionCount: this.discussionCount,
        isLoadingUserData: this.isLoadingUserData,
        info: cloneDeep(this.info),
        user: cloneDeep(this.user),
        users: cloneDeep(this.users),
        admin: cloneDeep(this.admin),
        currentReplyAreaId: this.currentReplyAreaId,
        selectedCommentUserInfo: cloneDeep(this.selectedCommentUserInfo),
      };
    },
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
    listenTo(event, callback, identifier) {
      if (identifier) {
        Object.defineProperty(callback, '_uid', {
          value: identifier,
          writable: false,
          enumerable: true,
          configurable: true,
        });
      }
      return this.$on(event, callback);
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
    enough(event, callback, identifier) {
      if (identifier) {
        if (!this._events[event]) return this;
        const cbIdx = this._events[event].findIndex(cb => cb._uid === identifier);
        this._events[event].splice(cbIdx, 1);
        return this;
      }

      if (callback) {
        return this.$off(event, callback);
      }

      return this.$off(event);
    },
  },
});

export default bus;
