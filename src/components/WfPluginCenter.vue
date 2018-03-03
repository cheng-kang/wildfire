<style scoped>
.pane-warp {
  min-height: 100px;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.unavailable-tips {
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
<template>
  <i-tabs value="added" class="wf-plugin-center" @on-click="switchPluginTab">
    <i-tab-pane label="已添加" name="added">
      <div class="pane-warp">
        <div v-if="Object.keys(pluginCenter).length === 0" class="unavailable-tips">
          你还没有添加插件，快去插件市场添加试试吧！
        </div>
        <i-collapse v-else :accordion="true">
          <i-panel
            v-for="(plugin, module) in pluginCenter"
            :key="module"
            :name="module">
            <span>{{plugin.name}} - {{plugin.author}}</span>
            <i-switch size="small" slot="extra" :disabled="true"></i-switch>
            <div slot="content">
              <p>{{plugin.description}}</p>
              <component
                v-if="pluginDashboards[plugin.module]"
                :is="pluginDashboards[plugin.module]"
                :t="pluginTranslate(module)"></component>
              <p>更多信息，请前往 <a href="plugin.homepage" :title="plugin.homepage" target="_blank">插件主页</a> 。</p>
            </div>
          </i-panel>
      </i-collapse>
      </div>
    </i-tab-pane>
    <i-tab-pane label="插件市场" name="market" :disabled="isLoadingPluginConfig">
      <div class="pane-warp">
        <i-spin size="large" fix v-if="isLoadingPluginMarket"></i-spin>
        <div v-if="!isLoadingPluginMarket && !isLoadedPluginMarket" class="unavailable-tips">
          抱歉，暂时没有找到可用的插件。<br>
          <i-button
            type="text"
            icon="ios-loop-strong"
            @click="loadPluginMarket">重新加载</i-button>
        </div>
        <i-row type="flex" justify="center" align="top" :gutter="20">
          <i-col span="11" v-for="(plugin, index) in updatePluginAddedState(pluginMarket)" :key="plugin.id" class="plugin-card">
            <i-card dis-hover>
              <p slot="title">{{plugin.name}}</p>
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
                  @click="addPlugin(plugin, index)"
                  :disabled="plugin.isAdded">添加</i-button>
              </span>
              <div class="scorll-warp">
                <div class="plugin-info">
                  <div class="info-item">
                    <span class="info-title">简介</span>
                    <p>{{plugin.description}}</p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">项目主页</span>
                    <p><a :href="plugin.homepage" target="_blank" :title="plugin.homepage">{{trimString(plugin.homepage, 40)}}</a></p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">作者</span>
                    <p :title="plugin.author">{{trimString(plugin.author, 40)}}</p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">大小</span>
                    <p>{{plugin.size}}</p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">兼容性</span>
                    <p>支持{{plugin.support.join('、')}}</p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">语言</span>
                    <p>支持{{plugin.language.join('、')}}</p>
                  </div>
                  <div class="info-item">
                    <span class="info-title">发布时间</span>
                    <p>{{plugin.publish}}</p>
                  </div>
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

export default {
  name: 'wf-plugin-center',
  props: [],
  data() {
    return {
      isNoPluginAdded: true,
      isLoadingPluginConfig: false,
      isLoadingPluginMarket: false,
      isLoadedPluginMarket: false,

      // 存放注册激活过的插件dashboard组件名
      pluginDashboards: {},
      pluginMarket: [],
      marketInfo: {},
    };
  },
  mounted() {
    this.bus.$on('pluginDashboardAdd', (dashboard) => {
      this.pluginDashboards[dashboard.module] = dashboard.name;
      this.$forceUpdate();
    });
  },
  computed: {
    bus: () => Bus,
    auth: () => Bus.auth,
    config: () => Bus.config,
    db: () => Bus.db,
    i18next: () => Bus.i18next,
    pluginTranslate: () => Bus.pluginTranslate,
    pluginCenter: () => Bus.pluginCenter,
  },
  methods: {
    switchPluginTab(name) {
      if (name === 'market') {
        this.loadPluginMarket();
      }
    },
    loadPluginMarket() {
      if (!this.isLoadingPluginMarket && !this.isLoadedPluginMarket) {
        this.isLoadingPluginMarket = true;
        Vue.http.get('https://raw.githubusercontent.com/mrliaocn/test-plugin-market/master/plugins.json')
          .then(response => {
            const { plugins = [], description = '' } = JSON.parse(response.data);
            // 依据pluginCenter中是否存在，确定market中插件是否安装
            // this.updatePluginIsAdded(plugins)
            this.pluginMarket = plugins;
            this.marketInfo = {
              description,
            };
            this.isLoadedPluginMarket = Boolean(plugins.length);
          })
          .catch(error => {
            console.error(error);
          })
          .then(() => {
            this.isLoadingPluginMarket = false;
          });
      }
    },
    updatePluginAddedState(pluginMarket) {
      return pluginMarket.map((plugin) => {
        if (plugin.module in this.pluginCenter) {
          plugin.isAdded = true;
        } else {
          plugin.isAdded = false;
        }
        return plugin;
      });
    },
    addPlugin(plugin, index) {
      const {
        name, module, source, description, author, homepage,
      } = plugin;
      this.db.ref(`pluginCenter/${module}`).set({
        name, module, source, description, author, homepage, enable: false,
      })
        .then(() => {
          this.pluginMarket[index].isAdded = true;
          this.$forceUpdate();
        })
        .catch(() => {
          this.$Message.error('添加失败！');
        });
    },
    trimString(str, len) {
      if (str.length > len) {
        return `${str.substring(0, len - 3)}...`;
      }
      return str;

    },
  },
};

</script>
