import Vue from 'vue';
import { bus } from '../common';
import PCM from './WfPluginComponentManager';
import PHM from './WfPluginHookManager';
import WfPluginWidgetManager from './WfPluginWidgetManager';
import { PTM, PTM4Meta } from './WfPluginTranslationManager';
import pluginProps from './plugin-props';

export * from './helpers';
export * from './constants';

export { PCM, PHM, PTM, PTM4Meta, pluginProps };
export const PWM = new WfPluginWidgetManager();

export const injectPlugin = (pluginId) => {
  const plugin = window[pluginId];

  if (!plugin) {
    Vue.$Message.error('Plugin.error.no_plugin');
    return;
  }

  // TODO: test this part
  const { components, hooks, widgets, translation } = (plugin.default || plugin);

  Vue.set(bus.pluginsData, pluginId, {});
  PCM.add({ pluginId, components });
  PHM.add({ pluginId, hooks });
  PWM.add(widgets);
  PTM.add({ pluginId, translation });
}

export const ejectPlugin = (pluginId) => {
  const plugin = window[pluginId];

  if (!plugin) {
    Vue.$Message.error('Plugin.error.no_plugin');
    return;
  }

  const { components, hooks, widgets } = (plugin.default || plugin);

  PCM.remove({ pluginId, components });
  PHM.remove({ pluginId, hooks });
  PWM.remove(widgets);
  PTM.remove(pluginId);
  Vue.delete(bus.pluginsData, pluginId)
}

export const handlePluginHookError = (error) => {
  console.error(error);
  // not sure what to put here :)
};
