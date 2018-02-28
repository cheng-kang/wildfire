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
// import utils from './utils'
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
      pluginCenter: {
        // 'name': { source, context: plugin.default }
      },

      pluginComponents: [],
      events: {}
    }
  },
  computed: {
    isCurrentUserBanned () {
      return this.info.isBanned
    },
    utils () {
      // 全局传递、暴露的工具函数
      // 需要传递给plugin的函数等
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
    },
    // 加载和注册插件
    // 分为手动添加、从插件中心添加两种
    registerPlugins (pluginCenter) {
      for (module in pluginCenter) {
        // 如果已经存在，则不重复注册
        if (!this.pluginCenter[module]) {
          // 生成对象
          this.pluginCenter[module] = pluginCenter[module]
          // 注册对象
          this.registerOnePlugin(pluginCenter[module])
        }
      }
    },
    // 注册单个插件，并生成实例
    registerOnePlugin (pluginItem) {
      const { enable=false, module, source } = pluginItem

      // 必须包含module、source
      if (module && source) {
        let script = document.createElement('script')
        script.onload = () => {
          if (window[module]) {
            const context = window[module].default()
            this.pluginCenter[module].context = context
            // console.log(this.pluginCenter[module])
            // 如果存在插件配置项，则先激活插件配置组件，用于插件中心显示
            if (context.configComponment) {
              this.activeComponment(module, context.configComponment)
            }
            // 如果插件已经开启，则直接激活
            if (enable) {
              this.activePlugin(module)
            }
          } else {
            console.warn(`Invalid plugin: can not find '${module}', is the module correct ？`)
          }
        }
        script.src = source
        document.body.appendChild(script)
      } else {
        console.warn(`Invalid plugin: you need to set the 'module' and 'source' correctly.`)
      }
    },
    activeComponment(module, copt) {
      const coptName = `${module}-${copt.name}`
      Vue.component(coptName, copt)
      this.$emit('pluginConfigComponentAdd', {module, coptName})
    },
    activePlugin (module) {

    }
  }
})
export default Bus
