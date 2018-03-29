<template>
  <i-tabs value="added" class="wf-plugin-center">
    <i-tab-pane :label="t('PluginCenter.title.added_plugins')" name="added">
      <div class="pane-warp">
        <div v-if="!hasAddedPlugin" class="empty-msg">
          {{t('PluginCenter.text.no_added_plugin')}}
        </div>
        <i-collapse v-else :accordion="true">
          <i-panel
            v-for="plugin in addedPlugins"
            :key="plugin.id"
            :name="PT(plugin.id)(plugin.title)">
            <span>{{PT(plugin.id)(plugin.title)}}</span>
            <i-switch size="small" slot="extra" :value="plugin.isActive" @on-change="toggleAddedPluginState(plugin.id, plugin.isActive)"></i-switch>
            <div slot="content">
              <wf-separator :title="t('PluginCenter.title.desc')" margin-top="8px"/>
              <wf-marked-content :content="PT(plugin.id)(plugin.description)" :style="styles.cardContent"></wf-marked-content>
              <template v-if="plugin.options">
                <wf-separator :title="t('PluginCenter.title.options')"/>
                <wf-added-plugin-option-form :t="PT" :plugin-id="plugin.id" :options="plugin.options" :style="styles.cardContent"/>
              </template>
            </div>
          </i-panel>
        </i-collapse>
      </div>
    </i-tab-pane>
    <i-tab-pane :label="t('PluginCenter.title.plugin_center')" name="center">
      <div class="pane-warp">
        <div v-if="isPluginCenterEmpty" class="empty-msg">
          {{t('PluginCenter.text.no_plugin')}}<br>
          <i-button
            type="text"
            icon="ios-loop-strong"
            @click="loadPluginMetaData">{{t('PluginCenter.btn.reload')}}</i-button>
        </div>
        <i-row type="flex" justify="center" align="top" :gutter="20" v-else>
          <i-col span="11" v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
            <i-card dis-hover>
              <p slot="title">{{PT(plugin.id)(plugin.title)}}</p>
              <span slot="extra">
                <span v-if="plugin.isAdded" class="icon-warp">
                  <i-tooltip :transfer="true" placement="top"
                    content="t('PluginCenter.text.plugin_added')">
                    <i-icon type="checkmark-circled"></i-icon>
                  </i-tooltip>
                </span>
                <i-button v-else
                  size="small"
                  type="text"
                  @click="addPlugin(plugin.id)">{{t('PluginCenter.btn.add')}}</i-button>
              </span>
              <div class="scorll-warp">
                <div class="plugin-info">
                  <wf-marked-content :content="PT(plugin.id)(plugin.description)"></wf-marked-content>
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
import { bus, butler, PLUGIN_LIST_CDN } from '../common';
import { PTM4Meta } from '../plugin';
import { getKey } from '../utils';

export default {
  name: 'wf-plugin-center',
  props: [],
  data() {
    return {
      meta: [],
      addedPluginsFromCenter: {},
      PT: PTM4Meta.t(butler.config.locale),
    };
  },
  computed: {
    t: () => (key) => butler.i18next.t(key),
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
    butler.db.ref('addedPluginsFromCenter').on('child_added', snapshot => {
      const key = getKey(snapshot);
      this.$set(this.addedPluginsFromCenter, key, snapshot.val());
    });
    butler.db.ref('addedPluginsFromCenter').on('child_changed', snapshot => {
      const key = getKey(snapshot);
      this.$set(this.addedPluginsFromCenter, key, snapshot.val());
    });
  },
  methods: {
    loadPluginMetaData() {
      this.meta = [];
      Vue.http.get(PLUGIN_LIST_CDN)
        .then(({ data: pluginList }) => {
          Object.keys(pluginList).forEach(pluginId => {
            Vue.http.get(`${pluginList[pluginId]}/dist/meta.json`)
              .then(({ data: metaData }) => {
                this.meta.push({
                  ...metaData,
                  id: metaData.library,
                });
                PTM4Meta.add({ pluginId: metaData.library, translation: metaData.translation });
              })
              .catch(error => {
                console.error(error);
                this.$Message.error(this.t('PluginCenter.error.loading_plugin_meta'));
              });
          });
        })
        .catch((error) => {
          console.error(error);
          this.$Message.error(this.t('PluginCenter.error.loading_plugin_list'));
        })
    },
    addPlugin(pluginId) {
      butler.db.ref(`addedPluginsFromCenter/${pluginId}`).set(false)
        .then(() => {
          this.$Message.success(this.t('PluginCenter.success.adding_plugin'));
        })
        .catch(error => {
          console.error(error);
          this.$Message.error(this.t('PluginCenter.error.adding_plugin'));
        });
    },
    toggleAddedPluginState(pluginId, oldValue) {
      butler.db.ref(`addedPluginsFromCenter/${pluginId}`).set(!oldValue)
        .then(() => {
          this.$Message.success(this.t('PluginCenter.success.toggling_added_plugin_state'));
        })
        .catch(error => {
          console.error(error);
          this.$Message.error(this.t('PluginCenter.error.toggling_added_plugin_state'));
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
