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
    <i-tab-pane v-if="hasAddedPlugin" :label="t('PluginCenter.title.plugin_ordering')" name="ordering">
      <div class="pane-warp">
        <i-collapse accordion>
          <i-panel v-for="(cpnts, place) in order" :key="place" :name="place">
            {{place}}
            <p slot="content">
              <ul>
                <li v-for="(name, idx) in cpnts" :key="name">
                  <div><strong>{{idx+1}}.</strong></div>
                  <div>{{format(name)}}</div>
                  <div>
                    <i-button type="text" icon="ios-arrow-up" :disabled="idx === 0" @click="move('up', place, idx)"/>
                    <i-button type="text" icon="ios-arrow-down" :disabled="idx === (cpnts.length - 1)" @click="move('down', place, idx)"/>
                  </div>
                </li>
                <li>
                  <i-button type="primary" size="small" :disabled="!orderTouched[place]" @click="updateOrder(place)">{{t('PluginCenter.btn.update')}}</i-button>
                </li>
              </ul>
            </p>
          </i-panel>
        </i-collapse>
      </div>
    </i-tab-pane>
    <i-tab-pane :label="t('PluginCenter.title.plugin_center')" name="center">
      <div class="pane-warp">
        <div v-if="isPluginCenterEmpty" class="empty-msg">
          {{t('PluginCenter.text.no_plugin')}}<br/>
          <i-button
            type="text"
            icon="ios-loop-strong"
            @click="loadPluginMetaData">{{t('PluginCenter.btn.reload')}}</i-button>
        </div>
        <i-row type="flex" justify="space-between" align="top" v-else>
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
import union from 'lodash/union';
import { butler, PLUGIN_LIST_CDN } from '../common';
import { PCM, PTM4Meta, PLACES, splited } from '../plugin';
import { getKey } from '../utils';

export default {
  name: 'wf-plugin-center',
  props: [],
  data() {
    const savedOrder = {};
    const order = {};
    const orderTouched = {};
    Object.keys(PLACES).forEach((place) => {
      savedOrder[PLACES[place]] = [];
      order[PLACES[place]] = [];
      orderTouched[PLACES[place]] = false;
    });

    return {
      meta: [],
      addedPluginsFromCenter: {},
      PT: PTM4Meta.t(butler.config.locale),
      savedOrder,
      order,
      orderTouched,
      places: PLACES,
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
  watch: {
    savedOrder() {
      this.resetOrder();
    },
    plugins() {
      this.resetOrder();
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
    butler.db.ref('addedPluginOrder').once('value')
      .then((snapshot) => {
        const savedOrder = snapshot.val() || {};
        Object.keys(savedOrder).forEach((place) => {
          this.$set(this.savedOrder, place.replace('-', '.'), savedOrder[place]);
        });
      })
      .catch((error) => {
        console.error(error);
        this.$Message.error('PluginCenter.error.loading_added_plugin_order');
      })
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
    resetOrder() {
      Object.keys(this.savedOrder).forEach((place) => {
        this.$set(this.order, place, union(this.savedOrder[place], PCM.get(place)));
      });
    },
    format(name) {
      const { pluginId, componentName } = splited(name);
      return `${componentName} - ${pluginId}`;
    },
    move(direction, place, fromIndex) {
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      this.order[place].splice(toIndex, 0, this.order[place].splice(fromIndex, 1)[0]);
      this.$set(this.orderTouched, place, true);
    },
    updateOrder(place) {
      butler.db.ref(`/addedPluginOrder/${place.replace('.', '-')}`).set(this.order[place])
        .then(() => {
          this.$Message.success(this.t('PluginCenter.success.updating_order'));
          this.$set(this.orderTouched, place, false);
        })
        .catch(() => {
          this.$Message.error(this.t('PluginCenter.error.updating_order'));
        });
    },
  },
};
</script>

<style scoped>
.pane-warp {
  padding-top: 8px;
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
  margin-bottom: 15px;
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
.ivu-card {
  height: 184px;
}
ul {
  padding: 0 16px;
}
li {
  display: flex;
  align-items: center;
}
li > div:first-child {
  margin-right: 8px;
}
li > div:nth-child(2) {
  flex: 1;
  max-width: 308px;
  overflow-x: auto;
}
li > div:last-child {
  display: flex;
}
li:last-child {
  margin-top: 8px;
}
</style>
