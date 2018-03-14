<template>
  <i-tabs value="added" class="wf-plugin-center">
    <i-tab-pane label="已添加" name="added">
      <div class="pane-warp">
        <div v-if="!hasAddedPlugin" class="empty-msg">
          你还没有添加插件，快去插件市场添加试试吧！
        </div>
        <i-collapse v-else :accordion="true">
          <i-panel
            v-for="plugin in addedPlugins"
            :key="plugin.id"
            :name="t(plugin.id)(plugin.title)">
            <span>{{t(plugin.id)(plugin.title)}}</span>
            <i-switch size="small" slot="extra" :value="plugin.isActive" @on-change="toggleAddedPluginState(plugin.id, plugin.isActive)"></i-switch>
            <div slot="content">
              <wf-separator title="介绍" margin-top="8px"/>
              <wf-marked-content :content="t(plugin.id)(plugin.description)" :style="styles.cardContent"></wf-marked-content>
              <wf-separator title="设置"/>
              <wf-added-plugin-option-form :plugin-id="plugin.id" :options="plugin.options" :style="styles.cardContent"/>
            </div>
          </i-panel>
        </i-collapse>
      </div>
    </i-tab-pane>
    <i-tab-pane label="插件市场" name="center">
      <div class="pane-warp">
        <div v-if="isPluginCenterEmpty" class="empty-msg">
          抱歉，暂时没有找到可用的插件。<br>
          <i-button
            type="text"
            icon="ios-loop-strong"
            @click="loadPluginMetaData">重新加载</i-button>
        </div>
        <i-row type="flex" justify="center" align="top" :gutter="20" v-else>
          <i-col span="11" v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
            <i-card dis-hover>
              <p slot="title">{{t(plugin.id)(plugin.title)}}</p>
              <span slot="extra">
                <span v-if="plugin.isAdded" class="icon-warp">
                  <i-tooltip :transfer="true" placement="top"
                    content="插件已添加">
                    <i-icon type="checkmark-circled"></i-icon>
                  </i-tooltip>
                </span>
                <i-button v-else
                  size="small"
                  type="text"
                  @click="addPlugin(plugin.id)">添加</i-button>
              </span>
              <div class="scorll-warp">
                <div class="plugin-info">
                  <wf-marked-content :content="t(plugin.id)(plugin.description)"></wf-marked-content>
                </div>
              </div>
            </i-card>
          </i-col>
        </i-row>
      </div>
    </i-tab-pane>
  </i-tabs>
</template>

<script>
import Vue from 'vue';
import Bus from '../common/bus';
import { getKey, PTM } from '../utils';

export default {
  name: 'wf-plugin-center',
  props: [],
  data() {
    return {
      meta: [],
      addedPluginsFromCenter: {},
      t: PTM.t(Bus.config.locale),
    };
  },
  computed: {
    bus: () => Bus,
    auth: () => Bus.auth,
    config: () => Bus.config,
    db: () => Bus.db,
    i18next: () => Bus.i18next,
    pluginTranslate: () => Bus.pluginTranslate,
    pluginCenter: () => Bus.pluginCenter,
    isPluginCenterEmpty() {
      return Object.keys(this.meta).length === 0;
    },
    hasAddedPlugin() {
      return Object.keys(this.addedPluginsFromCenter).length !== 0;
    },
    plugins() {
      return this.meta.map(plugin => ({
        ...plugin,
        isAdded: this.addedPluginsFromCenter[plugin.id] !== undefined,
        isActive: this.addedPluginsFromCenter[plugin.id] === true,
      }));
    },
    inactivePlugins() {
      return this.plugins.filter(({ isAdded, isActive }) => isAdded && !isActive);
    },
    activePlugins() {
      return this.plugins.filter(({ isAdded, isActive }) => isAdded && isActive);
    },
    addedPlugins() {
      return [...this.activePlugins, ...this.inactivePlugins];
    },
    styles() {
      return {
        cardContent: {
          width: 'calc(100% - 48px)',
          margin: '0 auto',
        },
      };
    },
  },
  created() {
    this.loadPluginMetaData();
    this.db.ref('addedPluginsFromCenter').on('child_added', snapshot => {
      const key = getKey(snapshot);
      this.$set(this.addedPluginsFromCenter, key, snapshot.val());
    });
    this.db.ref('addedPluginsFromCenter').on('child_changed', snapshot => {
      const key = getKey(snapshot);
      this.$set(this.addedPluginsFromCenter, key, snapshot.val());
    });
  },
  methods: {
    loadPluginMetaData() {
      this.meta = [];
      Vue.http.get('https://cdn.rawgit.com/wildfirejs/wf-plugin-center/fd1b156f/plugins.json')
        .then(({ data: pluginsData }) => {
          const { plugins = {} } = pluginsData;
          plugins.forEach(({ id, source }) => {
            let baseURL = source;
            if (baseURL[baseURL.length - 1] !== '/') {
              baseURL += '/';
            }
            Vue.http.get(`${baseURL}meta.json`)
              .then(({ data: metaData }) => {
                this.meta.push({
                  ...metaData,
                  id,
                });
                PTM.add({ pluginId: id, translation: metaData.translation });
              });
          });
        })
        .catch(error => {
          console.error(error);
          this.$Message.error(this.i18next.t('PluginCenter.error.loading_all_plugins'));
        });
    },
    addPlugin(pluginId) {
      this.db.ref(`addedPluginsFromCenter/${pluginId}`).set(false)
        .then(() => {
          this.$Message.success('PluginCenter.success.adding_plugin');
        })
        .catch(error => {
          console.error(error);
          this.$Message.error('PluginCenter.error.adding_plugin');
        });
    },
    toggleAddedPluginState(id, oldValue) {
      this.db.ref(`addedPluginsFromCenter/${id}`).set(!oldValue)
        .then(() => {
          this.$Message.success('PluginCenter.success.toggling_added_plugin_state');
        })
        .catch(error => {
          console.error(error);
          this.$Message.error('PluginCenter.error.toggling_added_plugin_state');
        });
    },
  },
};
</script>

<style scoped>
.pane-warp {
  min-height: 100px;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.empty-msg {
  text-align: center;
  margin: 20px auto;
}
.scorll-warp {
  position: relative;
  overflow: hidden;
}
.plugin-card {
  margin-bottom: 15px
}
.icon-warp {
  display: inline-block;
  padding: 2px 10px;
}
.plugin-info {
  position: static;
  width: 100%;
  max-height: 100px;
  overflow-y: auto;
  /*隐藏滚动条*/
  overflow-x: hidden;
  margin-right: -30px;
}
.plugin-info .info-item {
  margin-bottom: 5px;
  width: 100%;
  /*校正滚动元素的右偏*/
  padding-right: 13px;
}
.plugin-info .info-title {
  font-size: 12px;
  color: #aaa
}
</style>
