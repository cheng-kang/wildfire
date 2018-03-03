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
import Vue from 'vue';
import { addTranslation } from './loadI18next';
// import utils from './utils'
const Bus = new Vue({
  data() {
    return {
      windowWidth: 0,
      discussionCount: 0,
      /* Mention */
      isLoadingUserData: true,
      info: { ip: 'unknown', isBanned: false },
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
      pluginCenter: {},
      pluginComponents: {},
      pluginHooks: {},
    };
  },
  computed: {
    isCurrentUserBanned() {
      return this.info.isBanned;
    },
    utils() {
      // 全局传递、暴露的工具函数
      // 需要传递给plugin的函数等
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
    filteredBus(eventName) {
      console.log(eventName);
      // TODO:
      // 由于bus内部的变量涉及太多全局的状态，所以与事件无关的内部的变量需要被过滤，
      // 尤其是events变量（之前的hooks），包含其他插件的事件函数，不可以允许被修改。
      return Bus;
    },
    // 加载和注册插件
    // 分为手动添加、从插件中心添加两种
    registerPlugins(plugins) {
      // 删除已经失效的插件
      Object.keys(this.pluginCenter).forEach((module) => {
        if (!plugins[module]) {
          this.inactivePlugin(module);
          delete this.pluginCenter[module];
        }
      });
      plugins.forEach(module => {
        // 判断是否注册过，对未注册的插件进行注册
        const suppose = this.pluginCenter[module];
        if (!suppose || suppose.source !== plugins[module].source) {
          // 对没注册的插件进行注册
          this.pluginCenter[module] = plugins[module];
          // 存放该插件注册的非dashboard组件名与钩子位置，用于关闭插件使用
          this.pluginCenter[module].components = [];
          this.pluginCenter[module].hooks = [];
          this.registerOnePlugin(plugins[module]);
        } else {
          // 已注册过还未激活的，依据enable激活或者取消激活（开启或关闭）
          if (plugins[module].enable && !this.pluginCenter[module].enable) {
            this.activePlugin(module);
          } else if (!plugins[module].enable && this.pluginCenter[module].enable) {
            this.inactivePlugin(module);
          }
          // 更新激活状态
          this.pluginCenter[module].enable = plugins[module].enable;
        }
      });
    },
    // 注册单个插件，并生成实例
    registerOnePlugin(pluginItem) {
      const { enable = false, module, source } = pluginItem;

      // 必须包含module、source
      if (module && source) {
        const script = document.createElement('script');
        script.onload = () => {
          if (window[module]) {
            const context = window[module].default();
            delete window[module];
            this.pluginCenter[module].context = context;
            // console.log(this.pluginCenter[module])
            // 如果存在插件配置项，则先激活插件配置组件，用于插件中心显示
            if (context.dashboard) {
              const name = this.activeComponment(module, context.dashboard);
              this.$emit('pluginDashboardAdd', { module, name });
            }
            // 在注册时直接添加翻译
            if (typeof context.translation === 'object') {
              const { translation } = context;
              Object.keys(translation).forEach((lang) => {
                // 翻译的层级为：`plugin.${module}.${key}`
                addTranslation(lang, { plugin: { [module]: translation[lang] } });
              });
            }
            // 如果插件已经开启，则直接激活
            if (enable) {
              this.activePlugin(module);
            }
          } else {
            console.warn(`Invalid plugin: can not find '${module}', is the module correct ？`);
          }
        };
        script.src = source;
        document.body.appendChild(script);
      } else {
        console.warn('Invalid plugin: you need to set the \'module\' and \'source\' correctly.');
      }
    },
    activeComponment(module, component) {
      const name = `${module}-${component.name}`;
      Vue.component(name, component);
      return name;
    },
    activePlugin(module) {
      const { components = {}, hooks = {} } = this.pluginCenter[module].context;
      const componentsPos = ['header.before', 'header.after', 'menu.personal',
        'menu.admin', 'menu.plugin', 'comments.before', 'footer.before',
        'comment.menu.top', 'comment.menu.bottom', 'comment.buttons.pre',
        'comment.buttons.post'];
      componentsPos.forEach((position) => {
        if (components[position] && components[position].length) {
          // 初始化
          if (typeof this.pluginComponents[position] !== 'object') {
            this.pluginComponents[position] = {};
          }
          components[position].forEach((component) => {
            const name = this.activeComponment(module, component);
            this.pluginComponents[position][name] = module;
            this.pluginCenter[module].components.push({ position, name });
            this.$emit('pluginUpdate');
          });
        }
      });

      const hooksPos = ['beforePostComment'];
      hooksPos.forEach((position) => {
        if (hooks[position] && typeof hooks[position] === 'function') {
          if (typeof this.pluginHooks[position] !== 'object') {
            this.pluginHooks[position] = {};
          }
          this.pluginHooks[position][module] = hooks[position];
          this.pluginCenter[module].hooks.push(position);
        }
      });
    },
    inactivePlugin(module) {
      const { components, hooks } = this.pluginCenter[module];
      components.forEach((component) => {
        delete this.pluginComponents[component.position][component.name];
        this.$emit('pluginUpdate');
      });
      hooks.forEach((position) => {
        delete this.pluginHooks[position][module];
      });
    },
    pluginTranslate(prefix) {
      return (key) => this.i18next.t(`plugin.${prefix}.${key}`);
    },
  },
});
export default Bus;
